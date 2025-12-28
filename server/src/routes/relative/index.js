import express from 'express'
import relativeController from '../../controllers/relative.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'

const router = express.Router()

router.use(verifyToken)
router.post('/createRelativeAccount', asyncHandler(relativeController.createRelativeAccount))
router.get('/readRelatives/:recordId', asyncHandler(relativeController.readRelatives))
router.get('/readMyPatientRecord', asyncHandler(relativeController.readMyPatientRecord))

export default router
