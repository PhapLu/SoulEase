import mongoose from 'mongoose'
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

const UserSchema = new Schema(
    {
        email: { type: String, required: true, trim: true, unique: true },
        fullName: { type: String, required: true, trim: true },
        password: { type: String, default: '' },
        role: {
            type: String,
            enum: ['member', 'family', 'doctor', 'clinic', 'nurse'],
            default: 'member',
        },
        clinicId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        speciality: { type: String, default: '' },
        description: { type: String, default: '' },
        clinicians: { type: String, default: '' },
        gender: { type: String, enum: ['male', 'female', 'other'], trim: true },
        jobTitle: { type: String, trim: true },
        avatar: {
            type: String,
            default: '/uploads/default_avatar.jpg',
        },
        assistDoctorId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        phone: { type: String },
        address: { type: String, default: '' },
        country: { type: String, default: 'Vietnam' },
        dob: { type: Date, default: null },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'active', 'block', 'inactive'],
        },
        accessToken: { type: String, default: '' },
        lastViewConversations: { type: Date, default: Date.now },
        lastViewNotifications: { type: Date, default: Date.now },
        activity: {
            isOnline: { type: Boolean, default: false },
            lastVisit: { type: Date, default: Date.now },
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

const User = mongoose.model(DOCUMENT_NAME, UserSchema)
export { User }
