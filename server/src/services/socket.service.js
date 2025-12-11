import Conversation from '../models/conversation.model.js'
import { User } from '../models/user.model.js'

const userSockets = new Map() // userId -> [socketId1, socketId2]
const inactiveUsers = new Set() // userIds that are backgrounded

// -- Utility Functions --
const addUser = (userId, socketId) => {
    if (!userSockets.has(userId)) {
        userSockets.set(userId, [])
    }
    const sockets = userSockets.get(userId)
    if (!sockets.includes(socketId)) {
        sockets.push(socketId)
    }
    logConnectedUsers()
}

const markUserOnline = async (userId) => {
    try {
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    'activity.isOnline': true,
                    'activity.lastVisit': new Date(),
                },
            }
        )
    } catch (err) {
        console.error('Error updating online status:', err.message)
    }
}

const markUserOffline = async (userId) => {
    try {
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    'activity.isOnline': false,
                    'activity.lastVisit': new Date(),
                },
            }
        )
    } catch (err) {
        console.error('Error updating offline status:', err.message)
    }
}

const removeUser = (socketId) => {
    for (const [userId, sockets] of userSockets.entries()) {
        const filtered = sockets.filter((id) => id !== socketId)
        if (filtered.length === 0) {
            userSockets.delete(userId)
            // ✅ mark offline when last socket is gone
            markUserOffline(userId)
        } else {
            userSockets.set(userId, filtered)
        }
    }
    console.log('❌ Socket disconnected:', socketId)
    logConnectedUsers()
}

const getUserSocketIds = (userId) => userSockets.get(userId) || []

const emitToUser = (userId, event, payload) => {
    const socketIds = getUserSocketIds(userId)
    if (socketIds.length === 0) {
        console.warn(`⚠️ No active sockets for user: ${userId}`)
        return
    }
    socketIds.forEach((id) => {
        global._io.to(id).emit(event, payload)
    })
}

const emitToUsers = (userIds, event, payload) => {
    userIds.forEach((userId) => emitToUser(userId, event, payload))
}

const getUsersList = () => {
    return Array.from(userSockets.entries()).map(([userId, socketIds]) => ({
        userId,
        socketCount: socketIds.length,
    }))
}

const logConnectedUsers = () => {
    // console.log(
    //     '📌 Users:',
    //     Array.from(userSockets.entries()).map(([id, socketIds]) => ({
    //         userId: id,
    //         socketIds,
    //     }))
    // )
}

const logUserStates = () => {
    // console.log(
    //     '🟢 Active users:',
    //     Array.from(userSockets.keys()).filter((id) => !inactiveUsers.has(id))
    // )
    // console.log('🔴 Inactive users:', Array.from(inactiveUsers))
}
// END -- Utility Functions --

// -- Main Socket Service --
class SocketServices {
    connection(socket) {
        console.log('✅ A user connected with socket.id:', socket.id)
        logConnectedUsers()

        socket.on('addUser', async (userId) => {
            addUser(userId, socket.id)
            await markUserOnline(userId)
            console.log('User connected with id:', userId)
            global._io.emit('getUsers', getUsersList())
            logUserStates()
        })

        socket.on('disconnect', () => {
            console.log('User disconnected with id:', socket.id)
            removeUser(socket.id)
            global._io.emit('getUsers', getUsersList())
        })

        socket.on('sendMessage', async (newMessage) => {
            const { senderId, conversationId } = newMessage

            try {
                const conversation = await Conversation.findById(conversationId).lean()
                if (!conversation) return

                const recipientIds = conversation.members
                    .map((m) => {
                        if (typeof m.user === 'object' && m.user._id) return m.user._id.toString()
                        return m.user.toString()
                    })
                    .filter((uid) => uid !== String(senderId))

                recipientIds.forEach((uid) => emitToUser(uid, 'getMessage', newMessage))

                console.log(`💬 Sent message → ${recipientIds.length} users`)
            } catch (err) {
                console.error('sendMessage error:', err)
            }
        })

        socket.on('userInactive', (userId) => {
            inactiveUsers.add(userId)
            console.log(`📴 Marked as inactive: ${userId}`)
            logUserStates()
        })

        socket.on('userActive', (userId) => {
            inactiveUsers.delete(userId)
            console.log(`✅ Marked as active: ${userId}`)
            logUserStates()
        })

        socket.on('messageSeen', async ({ conversationId, userId }) => {
            try {
                const conversation = await Conversation.findById(conversationId)
                if (!conversation) return

                let updated = false
                conversation.messages.forEach((msg) => {
                    if (msg.senderId.toString() !== userId.toString()) {
                        if (!msg.seenBy.some((id) => id.toString() === userId)) {
                            msg.seenBy.push(userId)
                            updated = true
                        }
                    }
                })

                if (updated) {
                    await conversation.save()
                    // notify others
                    const recipientIds = conversation.members.map((m) => m.user.toString()).filter((id) => id !== userId.toString())
                    recipientIds.forEach((uid) => {
                        emitToUser(uid, 'messageSeen', { conversationId, userId })
                    })
                }
            } catch (err) {
                console.error('Error handling messageSeen:', err)
            }
        })

        socket.on('sendTalentRequest', ({ senderId, talentRequest }) => {
            global._io.emit('getTalentRequest', { senderId, talentRequest })
        })

        socket.on('sendNotification', ({ senderId, receiverId, notification }) => {
            console.log('🔔 Sending notification to', receiverId, notification)
            emitToUser(receiverId, 'getNotification', notification)
        })
    }
}

export default new SocketServices()
