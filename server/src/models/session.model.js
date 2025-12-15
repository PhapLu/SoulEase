import mongoose from 'mongoose'
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'Session'
const COLLECTION_NAME = 'Sessions'

const SessionSchema = new Schema(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        sessionDate: { type: Date, default: Date.now },
        sessionType: {
            type: String,
            enum: ['in_person', 'video_call', 'audio_call', 'chat'],
            default: 'in_person',
        },
        durationMinutes: { type: Number, default: 45 },
        summary: { type: String, default: '', trim: true },
        keyPoints: [{ type: String, trim: true }],
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low',
        },
        nextSteps: { type: String, default: '', trim: true },
        isCompleted: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

const Session = mongoose.model(DOCUMENT_NAME, SessionSchema)
export default Session
