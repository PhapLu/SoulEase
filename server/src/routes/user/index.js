import express from 'express'
import userController from '../../controllers/user.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'
import { encryptionMiddleware } from '../../middlewares/encryptFields.middleware.js'

const router = express.Router()
router.get('/me', asyncHandler(userController.me))
router.get('/readDoctorDetail/:doctorId', asyncHandler(userController.readDoctorDetail))

export default router
