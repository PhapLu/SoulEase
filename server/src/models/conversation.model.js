import mongoose from 'mongoose'

const DOCUMENT_NAME = 'Conversation'
const COLLECTION_NAME = 'Conversations'

const ConversationSchema = new mongoose.Schema(
    {
        members: [
            {
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                isMuted: { type: Boolean, default: false },
            },
        ],
        thumbnail: { type: String, default: '/uploads/default-bg.png' },
        messages: [
            {
                senderId: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                content: { type: String },
                media: { type: [String] },
                reactions: [
                    {
                        emoji: { type: String, required: true },
                        reactors: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
                    },
                ],
                createdAt: { type: Date, default: Date.now },
                isSeen: {
                    type: Boolean,
                    default: false,
                },
                seenBy: [
                    {
                        type: mongoose.Types.ObjectId,
                        ref: 'User',
                    },
                ],
            },
        ],
        type: { type: String, default: '' },
        galaxyId: { type: mongoose.Types.ObjectId, ref: 'Galaxy' },
        roleplayRoomId: { type: mongoose.Types.ObjectId, ref: 'RoleplayRoom' },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

const Conversation = mongoose.model(DOCUMENT_NAME, ConversationSchema)
export default Conversation
