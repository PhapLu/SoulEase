import SessionService from '../services/session.service.js'
import { SuccessResponse } from '../core/success.response.js'

class SessionController {
    readSession = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await SessionService.readSession(req),
        }).send(res)
    }

    readSessions = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await SessionService.readSessions(req),
        }).send(res)
    }
    createSession = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await SessionService.createSession(req),
        }).send(res)
    }
    updateSession = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await SessionService.updateSession(req),
        }).send(res)
    }
    deleteSession = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await SessionService.deleteSession(req),
        }).send(res)
    }
}

export default new SessionController()
