import express from 'express'
import patientRecordController from '../../controllers/patientRecord.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'

const router = express.Router()
router.use(verifyToken)
router.get('/readPatientRecord/:patientId', asyncHandler(patientRecordController.readPatientRecord))
router.post('/createPatientRecord', asyncHandler(patientRecordController.createPatientRecord))
router.get('/readPatientRecords', asyncHandler(patientRecordController.readPatientRecords))
router.patch('/updatePatientRecord', asyncHandler(patientRecordController.updatePatientRecord))
router.delete('/deletePatientRecord', asyncHandler(patientRecordController.deletePatientRecord))

export default router
