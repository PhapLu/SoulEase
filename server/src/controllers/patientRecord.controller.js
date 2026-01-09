import PatientRecordService from '../services/patientRecord.service.js'
import { SuccessResponse } from '../core/success.response.js'

class PatientRecordController {
    readPatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await PatientRecordService.readPatientRecord(req),
        }).send(res)
    }

    readPatientRecords = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await PatientRecordService.readPatientRecords(req),
        }).send(res)
    }
    createPatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await PatientRecordService.createPatientRecord(req),
        }).send(res)
    }
    updatePatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await PatientRecordService.updatePatientRecord(req),
        }).send(res)
    }
    deletePatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await PatientRecordService.deletePatientRecord(req),
        }).send(res)
    }

    readPatientCharts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read patient charts!',
            metadata: await PatientRecordService.readPatientCharts(req),
        }).send(res)
    }

    uploadFile = async (req, res, next) => {
        new SuccessResponse({
            message: 'Upload file success!',
            metadata: await PatientRecordService.uploadFile(req),
        }).send(res)
    }

    deleteFile = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete file success!',
            metadata: await PatientRecordService.deleteFile(req),
        }).send(res)
    }
}

export default new PatientRecordController()
