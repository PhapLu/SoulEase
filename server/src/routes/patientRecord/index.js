import express from 'express'
import patientRecordController from '../../controllers/patientRecord.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'
import { uploadMemory } from '../../configs/multer.config.js'

const router = express.Router()
router.use(verifyToken)
router.get('/readPatientRecord/:patientId', asyncHandler(patientRecordController.readPatientRecord))
router.get('/readPatientCharts/:patientId', asyncHandler(patientRecordController.readPatientCharts))
router.post('/createPatientRecord', asyncHandler(patientRecordController.createPatientRecord))
router.get('/readPatientRecords', asyncHandler(patientRecordController.readPatientRecords))
router.patch('/updatePatientRecord/:recordId', asyncHandler(patientRecordController.updatePatientRecord))
router.delete('/deletePatientRecord', asyncHandler(patientRecordController.deletePatientRecord))
router.patch('/uploadFile/:recordId', uploadMemory.single('file'), asyncHandler(patientRecordController.uploadFile))
router.delete('/deleteFile/:recordId/:storageId', asyncHandler(patientRecordController.deleteFile))

export default router
