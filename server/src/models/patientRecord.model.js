import mongoose from 'mongoose'
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'PatientRecord'
const COLLECTION_NAME = 'PatientRecords'

const TreatmentPlanSchema = new Schema(
    {
        title: { type: String, default: '', trim: true },
        goals: { type: String, default: '', trim: true },
        startDate: { type: String, default: '' }, // YYYY-MM-DD
        frequency: { type: String, default: '', trim: true },
    },
    { _id: false }
)

const TreatmentSectionSchema = new Schema(
    {
        id: { type: String, required: true }, // "sess-..."
        date: { type: String, default: '' }, // YYYY-MM-DD
        focus: { type: String, default: '', trim: true },
        phq9: { type: Number, default: null },
        gad7: { type: Number, default: null },
        severity: { type: Number, min: 0, max: 10, default: 0 },
        risk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
        status: {
            type: String,
            enum: ['Planned', 'Completed', 'Cancelled'],
            default: 'Planned',
        },
        note: { type: String, default: '', trim: true },
    },
    { _id: false }
)

const PatientRecordSchema = new Schema(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        folderId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },

        title: { type: String, required: true, trim: true },
        recordType: {
            type: String,
            enum: ['assessment', 'diagnosis', 'section_note', 'progress_update', 'medication', 'lab_result', 'caregiver_update', 'daily_log', 'crisis_report'],
            default: 'section_note',
        },

        symptoms: [{ type: String, trim: true }],
        diagnosis: { type: String, default: '', trim: true },
        moodLevel: { type: Number, min: 0, max: 10, default: null },

        treatmentPlan: { type: String, default: '', trim: true },

        treatmentPlanData: { type: TreatmentPlanSchema, default: () => ({}) },
        treatmentSections: { type: [TreatmentSectionSchema], default: [] },

        medications: [
            {
                name: { type: String, trim: true },
                dosage: { type: String, trim: true },
                frequency: { type: String, trim: true },
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],

        attachments: [{ type: String }],

        caregiverNotes: { type: String, default: '', trim: true },
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
