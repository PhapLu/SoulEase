import express from 'express'
import sessionController from '../../controllers/session.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'

const router = express.Router()
router.use(verifyToken)
router.get('/readSession/:sessionId', asyncHandler(sessionController.readSession))
router.post('/createSession', asyncHandler(sessionController.createSession))
router.get('/readSessions/:patientId', asyncHandler(sessionController.readSessions))
router.patch('/updateSession/:recordId', asyncHandler(sessionController.updateSession))
router.delete('/deleteSession', asyncHandler(sessionController.deleteSession))

export default router
