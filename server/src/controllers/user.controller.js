import UserService from '../services/user.service.js'
import { SuccessResponse } from '../core/success.response.js'
import { BadRequestError } from '../core/error.response.js'

class UserController {
    me = async (req, res, next) => {
        if (!req.cookies.accessToken) throw new BadRequestError('Access token missing', 403)
        new SuccessResponse({
            message: 'Me success!',
            metadata: await UserService.me(req.cookies.accessToken),
        }).send(res)
    }

    meMobile = async (req, res, next) => {
        const authHeader = req.headers.authorization
        let token

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1] // ✅ Mobile token from header (not decrypted)
        } else {
            throw new BadRequestError('Access token missing', 403)
        }

        new SuccessResponse({
            message: 'Me success!',
            metadata: await UserService.meMobile(token), // Assuming `token` is not encrypted
        }).send(res)
    }

    readDoctorDetail = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read doctor detail success!',
            metadata: await UserService.readDoctorDetail(req),
        }).send(res)
    }
}

export default new UserController()
