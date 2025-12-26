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

    createStaff = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create doctor success!',
            metadata: await UserService.createStaff(req),
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

    readStaffs = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read doctors success!',
            metadata: await UserService.readStaffs(req),
        }).send(res)
    }

    readDoctors = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read doctors success!',
            metadata: await UserService.readDoctors(req),
        }).send(res)
    }

    readStaffDetail = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read doctor detail success!',
            metadata: await UserService.readStaffDetail(req),
        }).send(res)
    }

    readUserProfile = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read user profile success!',
            metadata: await UserService.readUserProfile(req),
        }).send(res)
    }

    updateUserProfile = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update user profile success!',
            metadata: await UserService.updateUserProfile(req),
        }).send(res)
    }

    updateStaffInfo = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update staff info success!',
            metadata: await UserService.updateStaffInfo(req),
        }).send(res)
    }
}

export default new UserController()
