import mongoose from 'mongoose'
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'Feedback'
const COLLECTION_NAME = 'Feedbacks'

const FeedbackSchema = new Schema(
    {
        patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        sessionId: { type: Schema.Types.ObjectId, ref: 'Session', default: null },

        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, default: '', trim: true },

        treatmentPhase: {
            type: String,
            enum: ['initial', 'mid', 'final', 'post_treatment'],
            default: 'final',
        },

        isAnonymous: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

const Feedback = mongoose.model(DOCUMENT_NAME, FeedbackSchema)
export default Feedback
