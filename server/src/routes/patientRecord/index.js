import express from 'express'
import patientRecordController from '../../controllers/patientRecord.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'

const router = express.Router()

router.use(verifyToken)

// -------- patient record --------
router.get('/readPatientRecord/:patientId', asyncHandler(patientRecordController.readPatientRecord))

router.post('/createPatientRecord', asyncHandler(patientRecordController.createPatientRecord))

router.get('/readPatientRecords', asyncHandler(patientRecordController.readPatientRecords))

router.patch('/updatePatientRecord/:recordId', asyncHandler(patientRecordController.updatePatientRecord))

router.delete('/deletePatientRecord/:recordId', asyncHandler(patientRecordController.deletePatientRecord))

// -------- treatment (use patientId to match your current FE route param) --------
router.get('/:patientId/treatment/plan', asyncHandler(patientRecordController.getTreatmentPlan))

router.patch('/:patientId/treatment/plan', asyncHandler(patientRecordController.updateTreatmentPlan))

router.get('/:patientId/treatment/sections', asyncHandler(patientRecordController.listTreatmentSections))

router.get('/:patientId/treatment/sections/latest', asyncHandler(patientRecordController.getLatestTreatmentSection))

router.post('/:patientId/treatment/sections', asyncHandler(patientRecordController.createTreatmentSection))

router.patch('/:patientId/treatment/sections/:sectionId', asyncHandler(patientRecordController.updateTreatmentSection))

router.delete('/:patientId/treatment/sections/:sectionId', asyncHandler(patientRecordController.deleteTreatmentSection))

export default router
