import express from 'express'
import userController from '../../controllers/user.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'
import { encryptionMiddleware } from '../../middlewares/encryptFields.middleware.js'

const router = express.Router()
router.get('/me', asyncHandler(userController.me))

router.use(verifyToken)
router.get('/readStaffs', asyncHandler(userController.readStaffs))
router.get('/readDoctors', asyncHandler(userController.readDoctors))
router.post('/createStaff', asyncHandler(userController.createStaff))
router.patch('/updateStaffInfo/:staffId', asyncHandler(userController.updateStaffInfo))
router.get('/readStaffDetail/:staffId', asyncHandler(userController.readStaffDetail))

export default router
