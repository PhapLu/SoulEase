import PatientRecord from '../models/patientRecord.model.js'
import Folder from '../models/folder.model.js'
import { User } from '../models/user.model.js'
import { AuthFailureError, BadRequestError, ForbiddenError, NotFoundError } from '../core/error.response.js'
import dotenv from 'dotenv'
import Conversation from '../models/conversation.model.js'
import Session from '../models/session.model.js'
dotenv.config()

class PatientRecordService {
    static createPatientRecord = async (req) => {
        const userId = req.userId
        const { fullName, email, dob, phoneNumber, role, relationship, folderId } = req.body

        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        let doctorId

        if (user.role === 'doctor') {
            doctorId = userId
        } else if (user.role === 'nurse') {
            if (!user.nurseProfile?.assistDoctorId) {
                throw new BadRequestError('Nurse is not assigned to any doctor')
            }
            doctorId = user.nurseProfile.assistDoctorId
        } else {
            throw new ForbiddenError('You do not have permission to create patient records')
        }

        // ⭐ LOAD DOCTOR (SOURCE OF DEFAULT PASSWORD)
        const doctor = await User.findById(doctorId)
        if (!doctor || doctor.role !== 'doctor') {
            throw new BadRequestError('Assigned doctor not found')
        }

        // ⭐ CHECK DEFAULT PASSWORD
        if (!doctor.defaultPassword || doctor.defaultPassword.trim() === '') {
            throw new BadRequestError('Doctor default password is not set. Please set it before creating patients.')
        }

        // Prevent duplicate patient
        const existingUser = await User.findOne({ email })
        if (existingUser) throw new BadRequestError('Patient already exists')

        // Folder ownership check (doctor-scoped)
        const folder = await Folder.findOne({ _id: folderId, doctorId })
        if (!folder) throw new NotFoundError('Folder not found or unauthorized')

        // ⭐ USE DOCTOR DEFAULT PASSWORD
        const patientPassword = doctor.defaultPassword

        const newUser = await User.create({
            email,
            fullName,
            dob,
            phone: phoneNumber,
            role: role === 'relative' ? 'family' : 'member',
            password: patientPassword,
            status: 'active',
        })

        // Create conversation (doctor ↔ patient)
        await Conversation.create({
            members: [{ user: doctorId }, { user: newUser._id }],
            messages: [
                {
                    senderId: doctorId,
                    content: `Welcome ${newUser.fullName}! This is your private chat with your care team.`,
                    createdAt: new Date(),
                    seenBy: [doctorId],
                },
            ],
        })

        // Attach patient to folder
        folder.records.push(newUser._id)
        await folder.save()

        // Create intake patient record
        const intakeRecord = await PatientRecord.create({
            doctorId,
            patientId: newUser._id,
            folderId,
            title: 'Initial Intake Record',
            recordType: 'assessment',
            visibility: 'doctor_only',
            caregiverNotes: role === 'relative' ? relationship : '',
        })

        return { user: newUser, intakeRecord }
    }

    static readPatientRecords = async (req) => {
        const userId = req.userId

        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        let doctorId
        if (user.role === 'doctor') {
            doctorId = userId
        } else if (user.role === 'nurse') {
            doctorId = user.nurseProfile?.assistDoctorId
            if (!doctorId) throw new BadRequestError('Nurse is not assigned to a doctor')
        } else {
            throw new ForbiddenError('You do not have permission to view records')
        }

        const records = await PatientRecord.find({ doctorId }).sort({ createdAt: -1 })

        return { records }
    }

    static readPatientRecord = async (req) => {
        const userId = req.userId
        const patientId = req.params.patientId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')
        console.log('User:', user)
        console.log('Patient ID:', patientId)

        // 2. Check patient
        const patient = await User.findById(patientId).select('fullName email phone gender birthday dob address avatar').lean()
        if (!patient) throw new NotFoundError('Patient not found')

        // 3. Find patient record
        let recordQuery

        if (user.role === 'member') {
            // Patient can only view their OWN record
            if (userId.toString() !== patientId.toString()) {
                throw new ForbiddenError('You can only view your own record')
            }

            recordQuery = {
                patientId: userId,
            }
        } else if (user.role === 'family') {
            recordQuery = {
                patientId,
                $or: [{ 'relatives.userId': userId }, { 'relatives.email': user.email }],
            }
        } else if (user.role === 'doctor') {
            recordQuery = {
                patientId,
                doctorId: userId,
            }
        } else if (user.role === 'nurse') {
            const doctorId = user.nurseProfile?.assistDoctorId
            if (!doctorId) {
                throw new BadRequestError('Nurse is not assigned to a doctor')
            }

            recordQuery = {
                patientId,
                doctorId,
            }
        } else {
            throw new ForbiddenError('You do not have permission to view this record')
        }

        const record = await PatientRecord.findOne(recordQuery).lean().exec()
        if (!record) throw new NotFoundError('Record not found')

        // 4. Fetch latest completed session
        const latestSession = await Session.findOne({
            patientId: patientId,
        })
            .sort({ sessionDate: -1 })
            .select('sessionDate sessionType durationMinutes riskLevel summary nextSteps')
            .lean()

        // 5. Normalize birthday
        const birthdayRaw = patient?.birthday || patient?.dob
        const birthdayDateOnly = birthdayRaw && !Number.isNaN(new Date(birthdayRaw).getTime()) ? new Date(birthdayRaw).toISOString().split('T')[0] : undefined

        // 6. Normalize latest session date
        const normalizedLatestSession = latestSession
            ? {
                  ...latestSession,
                  sessionDate: latestSession.sessionDate && !Number.isNaN(new Date(latestSession.sessionDate).getTime()) ? new Date(latestSession.sessionDate).toISOString().split('T')[0] : null,
              }
            : null

        // 7. Merge everything into ONE flat object
        const mergedRecord = {
            recordId: record._id,
            _id: record._id,

            // patient info
            ...patient,
            birthday: birthdayDateOnly || record?.birthday,

            // record info
            ...record,
            symptoms: (record?.symptoms || []).map((s) => ({
                name: s?.name || '',
                sign: s?.sign || '',
                date: s?.date && !Number.isNaN(new Date(s.date).getTime()) ? new Date(s.date).toISOString().split('T')[0] : '',
                status: s?.status || 'Active',
            })),

            // ⭐ NEW
            latestSession: normalizedLatestSession,
        }

        return { patientRecord: mergedRecord }
    }

    static updatePatientRecord = async (req) => {
        const userId = req.userId
        const recordId = req.params.recordId

        const { title, recordType, symptoms, diagnosis, moodLevel, treatmentPlan, treatmentSessions, treatmentSections, medications, attachments, caregiverNotes, doctorNotes, visibility, folderId } = req.body
        const { fullName, email, phone, address, gender, birthday, dob } = req.body

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')
        if (user.role === 'family' || user.role === 'member') {
            const recordQuery =
                user.role === 'member'
                    ? { _id: recordId, patientId: userId }
                    : { _id: recordId, $or: [{ 'relatives.userId': userId }, { 'relatives.email': user.email }] }

            const record = await PatientRecord.findOne(recordQuery)
            if (!record) throw new NotFoundError('Record not found')

            const patient = await User.findById(record.patientId)
            if (!patient) throw new NotFoundError('Patient not found')

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

        // 2. Check record
        let doctorId
        if (user.role === 'doctor') {
            doctorId = userId
        } else if (user.role === 'nurse') {
            doctorId = user.nurseProfile?.assistDoctorId
            if (!doctorId) throw new BadRequestError('Nurse is not assigned to a doctor')
        } else {
            throw new ForbiddenError('You do not have permission to update this record')
        }

        const record = await PatientRecord.findOne({
            _id: recordId,
            doctorId,
        })
        if (!record) throw new NotFoundError('Record not found')

        // 2.1 Load patient user for header updates
        const patient = await User.findById(record.patientId)
        if (!patient) throw new NotFoundError('Patient not found')

        // OPTIONAL: Check folder ownership if changing folder
        if (folderId) {
            const folder = await Folder.findOne({ _id: folderId, doctorId })
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
        if (treatmentPlan !== undefined) record.treatmentPlan = treatmentPlan
        if (treatmentSessions) record.treatmentSessions = treatmentSessions
        if (treatmentSections) record.treatmentSections = treatmentSections
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
