import express from 'express'
import patientRecordController from '../../controllers/patientRecord.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'

const router = express.Router()
router.use(verifyToken)
router.post('/createPatientRecord', asyncHandler(patientRecordController.createPatientRecord))
router.get('/readPatientRecord', asyncHandler(patientRecordController.readPatientRecord))
router.get('/readPatientRecords', asyncHandler(patientRecordController.readPatientRecords))
router.patch('/updatePatientRecord', asyncHandler(patientRecordController.updatePatientRecord))
router.delete('/deletePatientRecord', asyncHandler(patientRecordController.deletePatientRecord))

export default router
