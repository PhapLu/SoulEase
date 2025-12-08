import Conversation from '../models/conversation.model.js'
import { User } from '../models/user.model.js'
import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js'
import { uploadImageToS3 } from '../utils/s3.util.js'
import { checkAndSendInactivityEmail } from '../utils/checkUserActivity.util.js'

const DEFAULT_THUMB = '/uploads/default-bg.png'

class ConversationService {
    static readConversations = async (userId) => {
        // 1) Validate user
        const user = await User.findById(userId).select('_id').lean()
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2) Fetch conversations the user belongs to
        const conversations = await Conversation.find({
            'members.user': userId,
            messages: { $exists: true, $not: { $size: 0 } },
        })
            .populate('members.user', 'fullName avatar domainName activity')
            .populate('galaxyId', 'title avatar')
            .populate('roleplayRoomId', 'title artworks')
            .sort({ updatedAt: -1 })
            .lean()

        // 3) Compute title, thumbnail, and lastMessage
        const resolved = conversations.map((c) => {
            const type = c.type || ''
            let title = ''
            let thumbnail = c.thumbnail || DEFAULT_THUMB
            let otherMember = null

            if (type === '') {
                // Direct chat
                const others = (c.members || []).filter((m) => m?.user?._id?.toString() !== userId.toString())

                if (others.length === 1) {
                    const u = others[0]?.user
                    otherMember = u
                        ? {
                              _id: u._id,
                              fullName: u.fullName,
                              domainName: u.domainName,
                              avatar: u.avatar,
                              activity: u.activity,
                          }
                        : null

                    title = u?.fullName?.trim() || u?.domainName?.trim() || 'Unknown user'
                    thumbnail = u?.avatar || thumbnail || DEFAULT_THUMB
                } else {
                    const names = others
                        .map((m) => m?.user?.fullName || m?.user?.domainName)
                        .filter(Boolean)
                        .slice(0, 3)
                    title = names.length ? names.join(', ') : 'Direct conversation'
                }
            } else if (type === 'roleplayRoom') {
                title = c.roleplayRoomId?.title || 'Untitled Roleplay Room'
                thumbnail = c.thumbnail || c.roleplayRoomId?.artworks?.[0] || DEFAULT_THUMB
            } else if (type === 'galaxy') {
                title = c.galaxyId?.title || 'Untitled Galaxy'
                thumbnail = c.thumbnail || c.galaxyId?.avatar || DEFAULT_THUMB
            } else {
                title = 'Conversation'
                thumbnail = c.thumbnail || DEFAULT_THUMB
            }

            // Get the last message safely
            const lastMessage = (c.messages && c.messages.length && c.messages[c.messages.length - 1]) || null

            return {
                _id: c._id,
                type,
                title,
                thumbnail,
                lastMessage, // includes senderId, content, createdAt, etc.
                updatedAt: c.updatedAt,
                createdAt: c.createdAt,
                members: (c.members || []).map((m) => ({
                    _id: m?.user?._id,
                    fullName: m?.user?.fullName,
                    domainName: m?.user?.domainName,
                    avatar: m?.user?.avatar,
                    activity: m?.user?.activity,
                })),
                ...(type === '' && otherMember ? { otherMember } : {}),
            }
        })

        return { conversations: resolved }
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

    static readConversationWithOtherMember = async (userId, otherMemberId) => {
        try {
            // 1. Check user and other member
            const user = await User.findById(userId).select('_id')
            const otherMember = await User.findById(otherMemberId).select('fullName avatar domainName activity')
            if (!user) throw new AuthFailureError('Please login to continue')
            if (!otherMember) throw new BadRequestError('Something went wrong')

            // 2. Read conversation
            const conversation = await Conversation.findOne({
                'members.user': {
                    $all: [userId, otherMemberId],
                },
            }).populate('members.user', 'fullName avatar domainName activity')

            if (!conversation) throw new NotFoundError('Conversation not found')

            // 3. Mark all messages from otherMember as seen
            let updated = false
            conversation.messages.forEach((message) => {
                if (message.senderId.toString() !== userId && !message.isSeen) {
                    message.isSeen = true
                    updated = true
                }
            })

            if (updated) {
                await conversation.save()
            }

            // 4. Format conversation
            const sortedMessages = conversation.messages
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 10)
                .reverse() // Reverse to maintain ascending order

            const formattedConversation = {
                _id: conversation._id,
                messages: sortedMessages,
                otherMember: {
                    _id: otherMember._id,
                    fullName: otherMember.fullName,
                    avatar: otherMember.avatar,
                    domainName: otherMember.domainName,
                    activity: otherMember.activity,
                },
            }

            return {
                conversation: formattedConversation,
            }
        } catch (error) {
            console.error('Error in readConversationWithOtherMember:', error)
            throw new Error('Failed to read conversation')
        }
    }

    static sendMessage = async (req) => {
        const userId = req.userId
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
        if (req.files && req.files.media) {
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

        // ✅ Find the receiver (the other member)
        const receiverMember = conversation.members.find((m) => m.user.toString() !== userId.toString())

        if (receiverMember) {
            // Load full receiver user info
            const receiver = await User.findById(receiverMember.user).select('fullName avatar email activity')

            // ✅ Only send inactivity email if NOT muted
            if (!receiverMember.isMuted) {
                await checkAndSendInactivityEmail(receiver)
            }
        }

        return {
            conversation,
            newMessage,
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
