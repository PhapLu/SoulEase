import Session from '../models/session.model.js'
import { User } from '../models/user.model.js'
import { AuthFailureError, BadRequestError, ForbiddenError, NotFoundError } from '../core/error.response.js'
import dotenv from 'dotenv'
import PatientRecord from '../models/patientRecord.model.js'
dotenv.config()

class SessionService {
    static createSession = async (req) => {
        const userId = req.userId
        const body = req.body

        // 1. Check user, patient
        const user = await User.findById(userId)
        if (!user) throw new NotFoundError('User not found')
        // if(user.role !== 'doctor') throw new ForbiddenError('Only doctors can create sessions')

        const patient = await User.findById(body.patientId)
        if (!patient) throw new NotFoundError('Patient not found')

        // 2. Create session
        const newSession = await Session.create({
            doctorId: userId,
            patientId: body.patientId,
            title: body.title,
            sessionType: body.sessionType,
            notes: body.notes,
            attachments: body.attachments || [],
            visibility: body.visibility || 'doctor_only',
        })

        return {
            session: newSession,
        }
    }

    static readSessions = async (req) => {
        const userId = req.userId
        const { patientId } = req.params

        // 1. Check user, patient, patient record
        const user = await User.findById(userId)
        if (!user) throw new NotFoundError('User not found')

        const patient = await User.findById(patientId)
        if (!patient) throw new NotFoundError('Patient not found')

        // const patientRecord = await PatientRecord.findOne({ patientId: patientId })
        // if (!patientRecord) throw new NotFoundError('Patient record not found')

        // 2. Check permission
        // if (userId !== patientId && userId !== patientRecord.doctorId.toString()) {
        //     throw new ForbiddenError('You do not have permission to access these sessions')
        // }

        // 3. Get sessions
        const sessions = await Session.find({ patientId: patientId })

        return {
            sessions,
        }
    }

    static readSession = async (req) => {
        const userId = req.userId
        const sessionId = req.params.sessionId

        // 1. Check user, session
        const user = await User.findById(userId)
        if (!user) throw new NotFoundError('User not found')

        const session = await Session.findById(sessionId)
        if (!session) throw new NotFoundError('Session not found')

        // 2. Check permission
        // if (session.patientId.toString() !== userId && session.doctorId.toString() !== userId) {
        //     throw new ForbiddenError('You do not have permission to access this session')
        // }

        return {
            session,
        }
    }

    static updateSession = async (req) => {}

    static deleteSession = async (req) => {}
}

export default SessionService
