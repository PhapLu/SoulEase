import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js'
import PatientRecord from '../models/patientRecord.model.js'
import { User } from '../models/user.model.js'

class RelativeService {
    static createRelativeAccount = async (req) => {
        const userId = req.userId
        const { patientRecordId, recordId, fullName, email, phoneNumber, relationship } = req.body

        if (!userId) throw new AuthFailureError('Please login to continue')
        if (!fullName || !email) throw new BadRequestError('Full name and email are required')

        const record = recordId
            ? await PatientRecord.findOne({ _id: recordId, doctorId: userId })
            : await PatientRecord.findOne({ patientId: patientRecordId, doctorId: userId })

        if (!record) throw new NotFoundError('Patient record not found')

        let relativeUser = await User.findOne({ email })
        if (!relativeUser) {
            const defaultPassword = '123'
            relativeUser = await User.create({
                email,
                fullName,
                phone: phoneNumber || '',
                role: 'family',
                password: defaultPassword,
                status: 'active',
            })
        }

        const exists = (record.relatives || []).some((r) => {
            const sameUser = r.userId && relativeUser && r.userId.toString() === relativeUser._id.toString()
            const sameEmail = r.email && email && r.email.toLowerCase() === String(email).toLowerCase()
            return sameUser || sameEmail
        })
        if (exists) throw new BadRequestError('Relative already exists')

        record.relatives = record.relatives || []
        record.relatives.push({
            userId: relativeUser._id,
            fullName,
            email,
            phoneNumber: phoneNumber || '',
            relationship: relationship || '',
        })

        await record.save()

        return { relatives: record.relatives }
    }

    static readRelatives = async (req) => {
        const userId = req.userId
        const { patientRecordId } = req.params
        if (!userId) throw new AuthFailureError('Please login to continue')

        const record = await PatientRecord.findOne({ patientId: patientRecordId, doctorId: userId })
        if (!record) throw new NotFoundError('Patient record not found')

        return { relatives: record.relatives || [] }
    }

    static readMyPatientRecord = async (req) => {
        const userId = req.userId
        if (!userId) throw new AuthFailureError('Please login to continue')

        const user = await User.findById(userId).select('email')
        if (!user) throw new AuthFailureError('Please login to continue')

        const record = await PatientRecord.findOne({
            $or: [{ 'relatives.userId': userId }, { 'relatives.email': user.email }],
        })
            .select('_id patientId folderId')
            .lean()

        if (!record) throw new NotFoundError('Patient record not found')

        return {
            patientRecord: {
                recordId: record._id,
                patientId: record.patientId,
                folderId: record.folderId,
            },
        }
    }
}

export default RelativeService
