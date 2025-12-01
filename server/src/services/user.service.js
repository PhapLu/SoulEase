import jwt from 'jsonwebtoken'
import { AuthFailureError, NotFoundError } from '../core/error.response.js'
import { decrypt } from '../configs/encryption.config.js'
import mongoose from 'mongoose'
import { User } from '../models/user.model.js'
import Order from '../models/order.model.js'
import Conversation from '../models/conversation.model.js'
import Notification from '../models/notification.model.js'
import dotenv from 'dotenv'
dotenv.config()

const COLLECTIONS = {
    Orders: Order,
    Users: User,
}

class UserService {
    static me = async (accessToken) => {
        // 1. Decode accessToken
        const decoded = jwt.verify(decrypt(accessToken), process.env.JWT_SECRET)
        if (!decoded?.id) throw new AuthFailureError('Invalid token')

        const userId = decoded.id.toString()

        // 2. Fetch user WITHOUT followers/following arrays
        const user = await User.findById(userId).select('-password -accessToken -googleId -followers -following').populate('referral.referred', 'avatar fullName domainName createdAt').populate('referral.referredBy', 'avatar fullName domainName createdAt').lean()

        if (!user) throw new NotFoundError('Please login to continue')

        // Pin code flag
        const hasSetPinCode = !!user.pinCode
        delete user.pinCode

        // -----------------------------------------
        // 🔥 3. OPTIMIZED: followersCount & followingCount
        // -----------------------------------------
        const [followersCount, followingCount] = await Promise.all([User.countDocuments({ following: userId }), User.countDocuments({ followers: userId })])
        // -----------------------------------------

        // 4. Parallel fetch unseen conversations & notifications
        const [filteredUnSeenConversations, unSeenNotifications] = await Promise.all([
            Conversation.find({
                members: { $elemMatch: { user: userId } },
                'messages.0': { $exists: true },
            })
                .select('members messages')
                .populate('members.user', 'avatar fullName domainName')
                .populate('messages.senderId', 'avatar fullName domainName')
                .lean()
                .then((conversations) =>
                    conversations.filter((conv) => {
                        const last = conv.messages?.[conv.messages.length - 1]
                        if (!last) return false

                        const senderId = last.senderId?._id?.toString() ?? last.senderId?.toString()
                        const seenBy = (last.seenBy || []).map((id) => id.toString())
                        const me = userId

                        return senderId !== me && !seenBy.includes(me)
                    })
                ),

            Notification.find({
                receiverId: new mongoose.Types.ObjectId(userId),
                isSeen: false,
            }).lean(),
        ])

        // 5. Fire-and-forget activity update
        User.updateOne({ _id: userId }, { $set: { 'activity.lastVisit': new Date() } }).exec()

        // 6. Return response
        return {
            user: {
                ...user,
                hasSetPinCode,
                followersCount, // 👈 clean & light
                followingCount, // 👈 clean & light
                unSeenConversations: filteredUnSeenConversations,
                unSeenNotifications,
            },
        }
    }

    static meMobile = async (accessToken) => {
        // 1. Decode accessToken and check
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
        if (!decoded) throw new AuthFailureError('Invalid token')

        // 2. Find user
        const userId = decoded.id
        if (!userId) throw new AuthFailureError('Invalid validation')

        // 3. Return user without password
        const user = await User.findById(userId).select('-password -accessToken -googleId').populate('followers', 'avatar fullName domainName').populate('following', 'avatar fullName domainName')
        if (!user) throw new NotFoundError('Please login to continue')

        //4. Update user activity visit
        user.activity.lastVisit = new Date()
        await user.save()

        // 5. Determine hasSetPinCode before removing pinCode
        let hasSetPinCode = false
        if (user.pinCode) {
            hasSetPinCode = true
        }

        // Fetch unseen conversations
        // Fetch unseen conversations
        const unSeenConversations = await Conversation.find({
            members: { $elemMatch: { user: userId } },
        })
            .populate('members.user messages.senderId')
            .lean()

        const filteredUnSeenConversations = unSeenConversations.filter((conversation) => {
            const last = conversation.messages?.[conversation.messages.length - 1]
            if (!last) return false

            const senderId = last.senderId && last.senderId._id ? last.senderId._id.toString() : last.senderId?.toString()

            const seenBy = (last.seenBy || []).map((id) => id.toString())
            const me = userId.toString()

            return senderId !== me && !seenBy.includes(me)
        })

        // Fetch unseen notifications
        const unSeenNotifications = await Notification.find({
            receiverId: new mongoose.Types.ObjectId(userId),
            isSeen: false,
        })

        // Convert user to plain object
        const userData = user.toObject()

        // Remove pinCode from userData
        delete userData.pinCode

        // Add additional properties
        userData.unSeenConversations = filteredUnSeenConversations
        userData.unSeenNotifications = unSeenNotifications

        return {
            user: { ...userData, hasSetPinCode },
        }
    }
}

export default UserService
