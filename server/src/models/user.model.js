import mongoose from 'mongoose'
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

const UserSchema = new Schema(
    {
        username: { type: String, required: true, trim: true, unique: true },
        email: { type: String, required: true, trim: true, unique: true },
        fullName: { type: String, required: true, trim: true },
        password: { type: String, default: '' },
        role: {
            type: String,
            enum: ['member', 'talent', 'admin'],
            default: 'member',
        },
        gender: { type: String, enum: ['male', 'female', 'other'], trim: true },
        jobTitle: { type: String, trim: true },
        avatar: {
            type: String,
            default: '/uploads/pastal_system_default_avatar.png',
        },
        phone: { type: String },
        address: { type: String, default: '' },
        country: { type: String, default: 'Vietnam' },
        pronoun: { type: String, default: '' },
        dob: { type: Date, default: null },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'active', 'block', 'inactive'],
        },
        pinCode: { type: String, default: '' },
        accessToken: { type: String, default: '' },
        lastViewConversations: { type: Date, default: Date.now },
        lastViewNotifications: { type: Date, default: Date.now },
        activity: {
            isOnline: { type: Boolean, default: false },
            lastVisit: { type: Date, default: Date.now },
            lastEmailReminder: { type: Date, default: null },
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

// Middleware to set the verificationExpiry field to 30 minutes in the future
UserSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('verificationExpiry')) {
        this.verificationExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    }
    next()
})

// Indexing for searching
UserSchema.index({ fullName: 'text', email: 'text', bio: 'text' })
UserSchema.index({ domainName: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ 'comments.userId': 1, 'comments.createdAt': -1 })

const User = mongoose.model(DOCUMENT_NAME, UserSchema)
export { User }
