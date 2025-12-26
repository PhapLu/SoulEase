import mongoose from 'mongoose'
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

const UserSchema = new Schema(
    {
        // =========================
        // ACCOUNT
        // =========================
        email: { type: String, required: true, trim: true, unique: true },
        password: { type: String, default: '' },
        role: {
            type: String,
            enum: ['member', 'family', 'doctor', 'clinic', 'nurse'],
            default: 'member',
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'block', 'inactive'],
            default: 'pending',
        },

        // =========================
        // BASIC PROFILE
        // =========================
        fullName: { type: String, required: true, trim: true },
        avatar: { type: String, default: '/uploads/default_avatar.jpg' },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        phone: { type: String },
        address: { type: String, default: '' },
        country: { type: String, default: 'Vietnam' },
        dob: { type: Date, default: null },

        // =========================
        // ORGANIZATION RELATION
        // =========================
        clinicId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        defaultPassword: { type: String, default: '' },

        // =========================
        // ROLE-SPECIFIC PROFILES
        // =========================
        doctorProfile: {
            speciality: { type: String, default: '' },
            description: { type: String, default: '' },
        },

        nurseProfile: {
            assistDoctorId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
        },

        clinicProfile: {
            clinicians: { type: String, default: '' },
        },

        // =========================
        // SYSTEM
        // =========================
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
