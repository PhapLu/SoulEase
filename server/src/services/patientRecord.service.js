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

        if (!doctor || (doctor.role !== 'doctor' && doctor.role !== 'clinic')) throw new ForbiddenError('Only doctors can create clients')

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

        // 2. Check patient (include dob for backward compatibility)
        const patient = await User.findById(patientId).select('fullName email phone gender birthday dob address').lean()

        if (!patient) throw new NotFoundError('Patient not found')

        // 3. Find patient record
        const record = await PatientRecord.findOne({
            patientId,
            doctorId: userId,
        })
            .lean()
            .exec()

        if (!record) throw new NotFoundError('Record not found')

        // 4. Merge into 1 clean FLAT object
        // Normalize birthday to date-only string to avoid timezone suffix
        const birthdayRaw = patient?.birthday || patient?.dob
        const birthdayDateOnly =
            birthdayRaw && !Number.isNaN(new Date(birthdayRaw).getTime())
                ? new Date(birthdayRaw).toISOString().split('T')[0]
                : undefined

        const mergedRecord = {
            recordId: record._id, // <— The REAL patientRecord ID
            ...patient, // patient info
            ...record, // record info
            _id: record._id, // keep `_id` as record ID too (optional)
            birthday: birthdayDateOnly || record?.birthday,
            symptoms: (record?.symptoms || []).map((s) => ({
                name: s?.name || '',
                sign: s?.sign || '',
                date:
                    s?.date && !Number.isNaN(new Date(s.date).getTime())
                        ? new Date(s.date).toISOString().split('T')[0]
                        : '',
                status: s?.status || 'Active',
            })),
        }

        return { patientRecord: mergedRecord }
    }

    static updatePatientRecord = async (req) => {
        const userId = req.userId
        const recordId = req.params.recordId

        const { title, recordType, symptoms, diagnosis, moodLevel, treatmentPlan, medications, attachments, caregiverNotes, doctorNotes, visibility, folderId } = req.body
        const { fullName, email, phone, address, gender, birthday, dob } = req.body

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Check record
        const record = await PatientRecord.findOne({ _id: recordId, doctorId: userId })
        if (!record) throw new NotFoundError('Record not found')

        // 2.1 Load patient user for header updates
        const patient = await User.findById(record.patientId)
        if (!patient) throw new NotFoundError('Patient not found')

        // OPTIONAL: Check folder ownership if changing folder
        if (folderId) {
            const folder = await Folder.findOne({ _id: folderId, doctorId: userId })
            if (!folder) throw new NotFoundError('Folder not found or unauthorized')
            record.folderId = folderId
        }

        // 3. Update record fields
        if (title && title.trim() !== '') record.title = title.trim()
        if (recordType) record.recordType = recordType
        if (symptoms) {
            const normalizedSymptoms = Array.isArray(symptoms)
                ? symptoms.map((s) => {
                      const name = s?.name ? String(s.name).trim() : ''
                      const sign = s?.sign ? String(s.sign).trim() : ''
                      const statusRaw = s?.status ? String(s.status) : 'Active'
                      const status = statusRaw.toLowerCase() === 'resolved' ? 'Resolved' : 'Active'
                      const dateRaw = s?.date || s?.createdAt || s?.updatedAt
                      let date = null
                      if (dateRaw) {
                          const d = new Date(dateRaw)
                          if (!Number.isNaN(d.getTime())) date = d
                      }
                      return {
                          name,
                          sign,
                          status,
                          date: date || new Date(),
                      }
                  })
                : []
            record.symptoms = normalizedSymptoms
        }
        if (diagnosis !== undefined) record.diagnosis = diagnosis.trim()
        if (moodLevel !== undefined) record.moodLevel = moodLevel
        if (treatmentPlan !== undefined) record.treatmentPlan = treatmentPlan.trim()
        if (medications) record.medications = medications
        if (attachments) record.attachments = attachments
        if (caregiverNotes !== undefined) record.caregiverNotes = caregiverNotes.trim()
        if (doctorNotes !== undefined) record.doctorNotes = doctorNotes.trim()
        if (visibility) record.visibility = visibility

        await record.save()

        // 4. Update patient profile fields (header)
        const updates = {}
        if (fullName !== undefined) updates.fullName = String(fullName).trim()
        if (email !== undefined) updates.email = String(email).trim()
        if (phone !== undefined) updates.phone = String(phone).trim()
        if (address !== undefined) updates.address = String(address).trim()
        if (gender !== undefined) {
            const g = String(gender).toLowerCase()
            if (['male', 'female', 'other'].includes(g)) {
                updates.gender = g
            }
        }
        const birthValue = birthday || dob
        if (birthValue !== undefined && birthValue !== null && birthValue !== '') {
            const date = new Date(birthValue)
            if (!isNaN(date.getTime())) {
                updates.dob = date
            }
        }

        if (Object.keys(updates).length) {
            Object.assign(patient, updates)
            await patient.save()
        }

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
