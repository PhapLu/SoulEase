import Conversation from '../models/conversation.model.js'
import { User } from '../models/user.model.js'
import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js'
import PatientRecord from '../models/patientRecord.model.js'
import Session from '../models/session.model.js'
// import { uploadImageToS3 } from '../utils/s3.util.js'

const DEFAULT_THUMB = '/uploads/default-bg.png'

class ConversationService {
    // GET /conversation/readConversations
    static readConversations = async (req) => {
        const userId = req.userId

        const conversations = await Conversation.find({
            'members.user': userId,
        })
            .populate('members.user', 'fullName avatar')
            .sort({ updatedAt: -1 })

        const mapped = conversations.map((c) => {
            const otherMembers = c.members.filter((m) => m.user._id.toString() !== userId.toString())

            const displayName = otherMembers.map((m) => m.user.fullName).join(', ')

            // ⭐ avatar logic
            const thumbnail = otherMembers.length === 1 ? otherMembers[0].user.avatar : otherMembers[0]?.user.avatar || '/uploads/default_avatar.jpg'

            const lastMsg = c.messages[c.messages.length - 1]

            return {
                id: c._id,
                displayName,
                thumbnail, // ✅ ADD THIS
                lastMessage: lastMsg?.content || '[media]',
                lastTime: lastMsg?.createdAt,
                unread: c.messages.filter((m) => !m.seenBy?.includes(userId)).length,
            }
        })

        return {
            conversations: mapped,
        }
    }

    static readMessages = async (req) => {
        const userId = req.userId
        const { conversationId } = req.params

        const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 10, 50))
        // If `before` not provided, we default to now → load newest "older" page
        const before = req.query.before ? new Date(req.query.before) : new Date()

        // 1) Validate user
        const user = await User.findById(userId).select('_id')
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2) Check membership quickly
        const conv = await Conversation.findById(conversationId).select('_id members')
        if (!conv) throw new NotFoundError('Conversation not found')
        const isMember = conv.members.some((m) => m.user.toString() === userId.toString() || m.user?._id?.toString() === userId.toString())
        if (!isMember) throw new AuthFailureError('You are not allowed to access this conversation')

        // 3) Aggregate to filter embedded messages older than `before`, return last `limit` of that subset
        const [result] = await Conversation.aggregate([
            { $match: { _id: conv._id } },
            {
                $project: {
                    messages: {
                        $filter: {
                            input: '$messages',
                            as: 'm',
                            cond: { $lt: ['$$m.createdAt', before] },
                        },
                    },
                },
            },
            // Take the last `limit` messages from that filtered subset
            { $project: { messages: { $slice: ['$messages', -limit] } } },
        ])

        const messages = result?.messages || []

        // Populate senderId & seenBy for those message docs
        // (Mongoose can populate plain objects too)
        await User.populate(messages, [
            { path: 'senderId', select: '_id domainName fullName avatar' },
            { path: 'seenBy', select: '_id fullName avatar' },
        ])

        // 4) Compute hasMore by counting whether there remain messages older than the oldest returned
        let hasMore = false
        let nextCursor = null
        if (messages.length > 0) {
            const oldest = messages[0].createdAt // because we sliced from the end; order may be ascending within slice
            nextCursor = oldest

            const [rem] = await Conversation.aggregate([
                { $match: { _id: conv._id } },
                {
                    $project: {
                        olderCount: {
                            $size: {
                                $filter: {
                                    input: '$messages',
                                    as: 'm',
                                    cond: { $lt: ['$$m.createdAt', oldest] },
                                },
                            },
                        },
                    },
                },
            ])
            hasMore = (rem?.olderCount || 0) > 0
        }

        // Ensure messages are sorted chronological ASC for the UI
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

        return {
            messages,
            hasMore,
            nextCursor, // ISO string on the frontend using messages[0].createdAt if needed
        }
    }

    // GET /conversation/readConversation/:id
    // static readConversationDetail = async (req) => {
    //     const { conversationId } = req.params
    //     const userId = req.userId

    //     const conversation = await Conversation.findById(conversationId).populate('members.user', 'fullName avatar email phone address dob gender role').populate('messages.senderId', 'fullName avatar')
    //     if (!conversation) throw new NotFoundError('Conversation not found')

    //     const otherMembers = conversation.members.filter((m) => m.user._id.toString() !== userId.toString())
    //     const thumbnail = otherMembers.length === 1 ? otherMembers[0].user.avatar : otherMembers[0]?.user.avatar || '/uploads/default_avatar.jpg'

    //     return {
    //         conversation: {
    //             ...conversation.toObject(),
    //             thumbnail, // ⭐ ADD THIS
    //         },
    //     }
    // }

    static readConversationDetail = async (req) => {
        const { conversationId } = req.params
        const userId = req.userId

        // ------------------------------------
        // FETCH CONVERSATION
        // ------------------------------------
        const conversation = await Conversation.findById(conversationId).populate('members.user', 'fullName avatar email phone address dob gender role').populate('messages.senderId', 'fullName avatar')

        if (!conversation) {
            throw new NotFoundError('Conversation not found')
        }

        // ------------------------------------
        // COLLECT MEMBER USER IDS
        // ------------------------------------
        const memberUserIds = conversation.members
            .map((m) => m.user)
            .filter((u) => u?.role === 'member')
            .map((u) => u._id)

        // ------------------------------------
        // FETCH LATEST USER INFO (AUTHORITATIVE)
        // ------------------------------------
        const latestUsers = await User.find({
            _id: { $in: memberUserIds },
        }).lean()

        const userMap = latestUsers.reduce((acc, u) => {
            acc[u._id.toString()] = u
            return acc
        }, {})

        // ------------------------------------
        // FETCH FULL PATIENT RECORDS
        // ------------------------------------
        const patientRecords = await PatientRecord.find({
            patientId: { $in: memberUserIds },
        }).lean()

        const patientRecordMap = patientRecords.reduce((acc, pr) => {
            acc[pr.patientId.toString()] = pr
            return acc
        }, {})

        // ------------------------------------
        // BUILD LATEST SESSION MAP (SIMPLE)
        // ------------------------------------
        const latestSessionMap = {}

        for (const pr of patientRecords) {
            const sessions = Array.isArray(pr.treatmentSessions) ? pr.treatmentSessions : []

            if (!sessions.length) {
                latestSessionMap[pr.patientId.toString()] = null
                continue
            }

            const latest = sessions.reduce((latest, curr) => {
                const d1 = new Date(latest.date || latest.createdAt || 0)
                const d2 = new Date(curr.date || curr.createdAt || 0)
                return d2 > d1 ? curr : latest
            })

            latestSessionMap[pr.patientId.toString()] = latest
        }

        // ------------------------------------
        // MERGE EVERYTHING INTO USER OBJECT
        // ------------------------------------
        const mergedMembers = conversation.members.map((m) => {
            const memberObj = m.toObject()
            const user = memberObj.user

            if (user?.role === 'member') {
                const uid = user._id.toString()

                return {
                    ...memberObj,
                    user: {
                        ...userMap[uid], // latest user info
                        patientRecord: patientRecordMap[uid] || null,
                        latestSessionInfo: latestSessionMap[uid] || null,
                    },
                }
            }

            return memberObj
        })

        // THUMBNAIL
        const otherMembers = mergedMembers.filter((m) => m.user._id.toString() !== userId.toString())
        const thumbnail = otherMembers.length === 1 ? otherMembers[0].user.avatar : otherMembers[0]?.user.avatar || '/uploads/default_avatar.jpg'

        return {
            conversation: {
                ...conversation.toObject(),
                members: mergedMembers,
                thumbnail,
            },
        }
    }

    static sendMessage = async (req) => {
        const userId = req.userId
        console.log(userId)
        console.log(req.body)
        const { conversationId, otherUserId } = req.body

        let conversation

        if (conversationId) {
            conversation = await Conversation.findById(conversationId)
            if (!conversation) throw new NotFoundError('Conversation not found')
        } else {
            const otherUser = await User.findById(otherUserId)
            if (!otherUser) throw new NotFoundError('Not found other member')

            conversation = new Conversation({
                members: [{ user: otherUser }, { user: otherUserId }],
                messages: [],
            })
            await conversation.save()
        }

        const { content } = req.body
        if (!content && (!req.files.media || req.files.media.length === 0)) {
            throw new BadRequestError('Please provide content or media')
        }

        let media = []
        if (req.files?.media?.length > 0) {
            const uploadPromises = req.files.media.map((file) =>
                uploadImageToS3({
                    buffer: file.buffer,
                    originalname: file.originalname,
                    width: 1920,
                    height: 1080,
                })
            )
            const uploadResults = await Promise.all(uploadPromises)
            media = uploadResults.map((r) => r.result.Key)
        }

        // Push new message with seenBy = [sender]
        const newMessage = {
            senderId: userId,
            content: req.body.content,
            createdAt: new Date(),
            media,
            seenBy: [userId],
        }
        conversation.messages.push(newMessage)
        await conversation.save()

        const saved = conversation.messages[conversation.messages.length - 1]

        return {
            conversation,
            newMessage: saved,
        }
    }

    static readMobileConversation = async (userId, conversationId, req) => {
        const { offset = 0, limit = 12, returnedMessageIds = [] } = req.query

        const limitNum = parseInt(limit + '', 10) || 12

        const user = await User.findById(userId).select('_id')
        if (!user) throw new AuthFailureError('Please login to continue')

        const conversation = await Conversation.findById(conversationId).populate('members.user', 'fullName avatar domainName pronoun')
        if (!conversation) throw new NotFoundError('Conversation not found')

        // 1. Mark messages as seen
        let updated = false
        for (let message of conversation.messages) {
            if (message.senderId.toString() !== userId && !message.isSeen) {
                message.isSeen = true
                updated = true
            }
        }
        if (updated) await conversation.save()

        // 2. Sort newest first
        const sorted = [...conversation.messages].sort((a, b) => b.createdAt - a.createdAt)

        // 3. Filter out returned messages
        const returnedIdsSet = new Set(returnedMessageIds.map((id) => id.toString()))
        const uniqueMessages = sorted.filter((m) => !returnedIdsSet.has(m._id.toString()))

        // 4. Paginate (from offset) and reverse for display
        const paginated = uniqueMessages.slice(0, limitNum).reverse()

        // 5. Get the other member
        const otherMember = conversation.members.find((member) => member.user._id.toString() !== userId)?.user

        return {
            conversation: {
                _id: conversation._id,
                messages: paginated,
                otherMember,
            },
        }
    }
}

export default ConversationService
