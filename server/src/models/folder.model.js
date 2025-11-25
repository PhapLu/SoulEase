import mongoose from 'mongoose'
const Schema = mongoose.Schema

const DOCUMENT_NAME = 'Folder'
const COLLECTION_NAME = 'Folders'

const FolderSchema = new Schema(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        title: { type: String, required: true, trim: true },
        description: { type: String, default: '', trim: true },

        // array of patient record IDs
        records: [{ type: Schema.Types.ObjectId, ref: 'PatientRecord' }],

        // optional patient ownership (folders could be per patient or multi-patient)
        patientId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

        isArchived: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

const Folder = mongoose.model(DOCUMENT_NAME, FolderSchema)
export default Folder
