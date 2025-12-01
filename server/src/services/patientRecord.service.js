import PatientRecord from '../models/patientRecord.model.js'
import Folder from '../models/folder.model.js'
import { User } from '../models/user.model.js'
import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js'
import dotenv from 'dotenv'
dotenv.config()

class PatientRecordService {
    // ----------------------------------------
    // CREATE
    // ----------------------------------------
    static createRecord = async (req) => {
        const userId = req.userId
        const { patientId, folderId, title, recordType, symptoms, diagnosis, moodLevel, treatmentPlan, medications, attachments, caregiverNotes, doctorNotes, visibility } = req.body

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Validate inputs
        if (!patientId) throw new BadRequestError('Patient ID is required')
        if (!title || title.trim() === '') {
            throw new BadRequestError('Record title is required')
        }

        // If folderId provided, validate it belongs to this doctor
        if (folderId) {
            const folder = await Folder.findOne({ _id: folderId, doctorId: userId })
            if (!folder) throw new NotFoundError('Folder not found or unauthorized')
        }

        // 3. Create record
        const newRecord = new PatientRecord({
            doctorId: userId,
            patientId,
            folderId: folderId || null,
            title: title.trim(),
            recordType,
            symptoms: symptoms || [],
            diagnosis: diagnosis ? diagnosis.trim() : '',
            moodLevel: moodLevel ?? null,
            treatmentPlan: treatmentPlan ? treatmentPlan.trim() : '',
            medications: medications || [],
            attachments: attachments || [],
            caregiverNotes: caregiverNotes ? caregiverNotes.trim() : '',
            doctorNotes: doctorNotes ? doctorNotes.trim() : '',
            visibility,
        })

        await newRecord.save()

        return { record: newRecord }
    }

    // ----------------------------------------
    // READ ALL (doctor's own records)
    // ----------------------------------------
    static readRecords = async (req) => {
        const userId = req.userId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Fetch all records created by this doctor
        const records = await PatientRecord.find({ doctorId: userId }).sort({ createdAt: -1 })

        return { records }
    }

    // ----------------------------------------
    // READ SINGLE RECORD
    // ----------------------------------------
    static readRecord = async (req) => {
        const userId = req.userId
        const recordId = req.params.recordId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Check record
        const record = await PatientRecord.findOne({ _id: recordId, doctorId: userId })
        if (!record) throw new NotFoundError('Record not found')

        return { record }
    }

    // ----------------------------------------
    // UPDATE
    // ----------------------------------------
    static updateRecord = async (req) => {
        const userId = req.userId
        const recordId = req.params.recordId

        const { title, recordType, symptoms, diagnosis, moodLevel, treatmentPlan, medications, attachments, caregiverNotes, doctorNotes, visibility, folderId } = req.body

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Check record
        const record = await PatientRecord.findOne({ _id: recordId, doctorId: userId })
        if (!record) throw new NotFoundError('Record not found')

        // OPTIONAL: Check folder ownership if changing folder
        if (folderId) {
            const folder = await Folder.findOne({ _id: folderId, doctorId: userId })
            if (!folder) throw new NotFoundError('Folder not found or unauthorized')
            record.folderId = folderId
        }

        // 3. Update fields
        if (title && title.trim() !== '') record.title = title.trim()
        if (recordType) record.recordType = recordType
        if (symptoms) record.symptoms = symptoms
        if (diagnosis !== undefined) record.diagnosis = diagnosis.trim()
        if (moodLevel !== undefined) record.moodLevel = moodLevel
        if (treatmentPlan !== undefined) record.treatmentPlan = treatmentPlan.trim()
        if (medications) record.medications = medications
        if (attachments) record.attachments = attachments
        if (caregiverNotes !== undefined) record.caregiverNotes = caregiverNotes.trim()
        if (doctorNotes !== undefined) record.doctorNotes = doctorNotes.trim()
        if (visibility) record.visibility = visibility

        await record.save()

        return { record }
    }

    // ----------------------------------------
    // DELETE
    // ----------------------------------------
    static deleteRecord = async (req) => {
        const userId = req.userId
        const recordId = req.params.recordId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Check record
        const record = await PatientRecord.findOne({ _id: recordId, doctorId: userId })
        if (!record) throw new NotFoundError('Record not found')

        // 3. Delete
        await record.deleteOne()

        return { message: 'Record deleted successfully' }
    }
}

export default PatientRecordService
