import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js'
import PatientRecord from '../models/patientRecord.model.js'
import { User } from '../models/user.model.js'

class RelativeService {
    static createRelativeAccount = async (req) => {
        const userId = req.userId
        const { recordId, fullName, email, phoneNumber, relationship } = req.body

        if (!userId) throw new AuthFailureError('Please login to continue')
        if (!fullName || !email) throw new BadRequestError('Full name and email are required')

        const record = await PatientRecord.findById(recordId)
        if (!record) throw new NotFoundError('Patient record not found')

        let relativeUser = await User.findOne({ email })

        if (!relativeUser) {
            const creator = await User.findById(userId)
            if (!creator) throw new AuthFailureError('Please login to continue')

            let doctorId
            if (creator.role === 'doctor') {
                doctorId = creator._id
            } else if (creator.role === 'nurse') {
                doctorId = creator.nurseProfile?.assistDoctorId
                if (!doctorId) throw new BadRequestError('Nurse is not assigned to a doctor')
            } else {
                throw new AuthFailureError('You do not have permission to create relatives')
            }

            const doctor = await User.findById(doctorId)
            if (!doctor || !doctor.defaultPassword?.trim()) {
                throw new BadRequestError('Doctor default password is not set')
            }

            relativeUser = await User.create({
                email,
                fullName,
                phone: phoneNumber || '',
                role: 'family',
                password: doctor.defaultPassword,
                status: 'active',
            })
        }

        const exists = record.relatives?.some((r) => r.userId.toString() === relativeUser._id.toString())
        if (exists) throw new BadRequestError('Relative already exists')

        record.relatives.push({
            userId: relativeUser._id,
            relationship: relationship || '',
        })

        await record.save()

        return { relatives: record.relatives }
    }

    static readRelatives = async (req) => {
        const userId = req.userId
        const { recordId } = req.params

        if (!userId) throw new AuthFailureError('Please login to continue')

        const record = await PatientRecord.findById(recordId).populate({
            path: 'relatives.userId',
            select: 'fullName email phone avatar role',
        })

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
