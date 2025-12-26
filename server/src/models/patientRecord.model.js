import mongoose from 'mongoose'
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'PatientRecord'
const COLLECTION_NAME = 'PatientRecords'

const PatientRecordSchema = new Schema(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        folderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },

        title: { type: String, required: true, trim: true },
        recordType: {
            type: String,
            enum: ['assessment', 'diagnosis', 'session_note', 'progress_update', 'medication', 'lab_result', 'caregiver_update', 'daily_log', 'crisis_report'],
            default: 'session_note',
        },

        symptoms: [
            {
                name: { type: String, trim: true },
                sign: { type: String, trim: true },
                date: { type: Date },
                status: {
                    type: String,
                    enum: ['Active', 'Resolved'],
                    default: 'Active',
                },
            },
        ],
        diagnosis: { type: String, default: '', trim: true },
        moodLevel: { type: Number, min: 0, max: 10, default: null },

        relatives: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                fullName: { type: String, trim: true },
                email: { type: String, trim: true },
                phoneNumber: { type: String, trim: true },
                relationship: { type: String, trim: true },
            },
        ],

        // Flexible treatment plan object
        treatmentPlan: { type: Schema.Types.Mixed, default: {} },
        // Treatment sessions
        treatmentSessions: [
            {
                id: { type: String, trim: true },
                date: { type: String, trim: true },
                focus: { type: String, trim: true },
                // allow symptom objects or strings
                symptoms: [{ type: Schema.Types.Mixed }],
                phq9: { type: Number, min: 0, max: 27 },
                gad7: { type: Number, min: 0, max: 21 },
                severity: { type: Number, min: 0, max: 10 },
                risk: { type: String, trim: true },
                status: { type: String, trim: true },
                note: { type: String, trim: true },
                result: { type: String, trim: true },
                treatment: { type: String, trim: true },
            },
        ],
        treatmentSections: [
            {
                id: { type: String, trim: true },
                date: { type: String, trim: true },
                focus: { type: String, trim: true },
                symptoms: [{ type: Schema.Types.Mixed }],
                phq9: { type: Number, min: 0, max: 27 },
                gad7: { type: Number, min: 0, max: 21 },
                severity: { type: Number, min: 0, max: 10 },
                risk: { type: String, trim: true },
                status: { type: String, trim: true },
                note: { type: String, trim: true },
                result: { type: String, trim: true },
                treatment: { type: String, trim: true },
            },
        ],
        medications: [
            {
                name: { type: String, trim: true },
                dosage: { type: String, trim: true },
                frequency: { type: String, trim: true },
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],

        // file URLs saved from Cloudinary / S3
        attachments: [{ type: String }],

        // caregiver contribution
        caregiverNotes: { type: String, default: '', trim: true },

        // doctor notes must be private
        doctorNotes: { type: String, default: '', trim: true },

        visibility: {
            type: String,
            enum: ['doctor_only', 'doctor_and_patient', 'doctor_patient_family'],
            default: 'doctor_only',
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

const PatientRecord = mongoose.model(DOCUMENT_NAME, PatientRecordSchema)
export default PatientRecord
