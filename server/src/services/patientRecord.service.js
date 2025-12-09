import PatientRecord from '../models/patientRecord.model.js'
import Folder from '../models/folder.model.js'
import { User } from '../models/user.model.js'
import { AuthFailureError, BadRequestError, ForbiddenError, NotFoundError } from '../core/error.response.js'
import dotenv from 'dotenv'
import Conversation from '../models/conversation.model.js'
dotenv.config()

class PatientRecordService {
    static createPatientRecord = async (req) => {
        const doctorId = req.userId
        const { fullName, email, dob, phoneNumber, role, relationship, folderId } = req.body

        // 1. Verify doctor and patient exists
        const doctor = await User.findById(doctorId)

        if (!doctor || doctor.role !== 'doctor') {
            throw new ForbiddenError('Only doctors can create clients')
        }

        const patient = await User.findOne({ email })
        if (patient) throw new BadRequestError('Patient already exists')

        // 2. Check folder belongs to this doctor
        const folder = await Folder.findOne({ _id: folderId, doctorId })
        if (!folder) throw new NotFoundError('Folder not found or unauthorized')

        // 3. Create Client as User
        const randomPassword = Math.random().toString(36).slice(-8)

        // 3. Create Client as User
        const newUser = await User.create({
            email,
            fullName,
            dob,
            phone: phoneNumber,
            role: role === 'relative' ? 'family' : 'member',
            password: randomPassword,
            status: 'active',
        })

        // ⭐ ADD THIS: Create conversation between doctor and patient/family
        let existingConversation = await Conversation.findOne({
            'members.user': { $all: [doctorId, newUser._id] },
        })

        if (!existingConversation) {
            existingConversation = await Conversation.create({
                members: [{ user: doctorId }, { user: newUser._id }],
                messages: [
                    {
                        senderId: doctorId,
                        content: `Welcome ${newUser.fullName}! This is your private chat with Dr. ${doctor.fullName}.`,
                        createdAt: new Date(),
                        seenBy: [doctorId],
                    },
                ],
            })
        }

        // 4. Add patient to folder.records
        folder.records.push(newUser._id)
        await folder.save()

        // 5. (Optional but recommended) Create default initial clinical record
        const intakeRecord = await PatientRecord.create({
            doctorId,
            patientId: newUser._id,
            folderId,
            title: 'Initial Intake Record',
            recordType: 'assessment',
            visibility: 'doctor_only',
            symptoms: [],
            diagnosis: '',
            treatmentPlan: '',
            doctorNotes: '',
            caregiverNotes: role === 'relative' ? relationship : '',
        })

        return {
            user: newUser,
            intakeRecord,
        }
    }

    static readPatientRecords = async (req) => {
        const userId = req.userId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Fetch all records created by this doctor
        const records = await PatientRecord.find({ doctorId: userId }).sort({ createdAt: -1 })

        return { records }
    }

    static readPatientRecord = async (req) => {
        const userId = req.userId
        const patientId = req.params.patientId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Check patient
        const patient = await User.findById(patientId).select('fullName email phone gender birthday address').lean()

        if (!patient) throw new NotFoundError('Patient not found')

        // 3. Find patient record
        const record = await PatientRecord.findOne({
            patientId,
            doctorId: userId,
        }).lean()

        if (!record) throw new NotFoundError('Record not found')

        // 4. Merge into 1 clean FLAT object
        const mergedRecord = {
            recordId: record._id, // <— The REAL patientRecord ID
            ...patient, // patient info
            ...record, // record info
            _id: record._id, // keep `_id` as record ID too (optional)
        }

        return { patientRecord: mergedRecord }
    }

    static updatePatientRecord = async (req) => {
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

    static deletePatientRecord = async (req) => {
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
