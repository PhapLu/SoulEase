import PatientRecordService from "../services/patientRecord.service.js";
import { SuccessResponse } from "../core/success.response.js";

class PatientRecordController {
    readPatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.readPatientRecord(req),
        }).send(res);
    };

    readPatientRecords = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.readPatientRecords(req),
        }).send(res);
    };
    createPatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.createPatientRecord(req),
        }).send(res);
    };
    updatePatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.updatePatientRecord(req),
        }).send(res);
    };
    deletePatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.deletePatientRecord(req),
        }).send(res);
    };

    // ----- TREATMENT -----
    getTreatmentPlan = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.getTreatmentPlan(req),
        }).send(res);
    };

    updateTreatmentPlan = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.updateTreatmentPlan(req),
        }).send(res);
    };

    listTreatmentSections = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.listTreatmentSections(req),
        }).send(res);
    };

    getLatestTreatmentSection = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.getLatestTreatmentSection(req),
        }).send(res);
    };

    createTreatmentSection = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.createTreatmentSection(req),
        }).send(res);
    };

    updateTreatmentSection = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.updateTreatmentSection(req),
        }).send(res);
    };

    deleteTreatmentSection = async (req, res, next) => {
        new SuccessResponse({
            message: "Me success!",
            metadata: await PatientRecordService.deleteTreatmentSection(req),
        }).send(res);
    };
}

export default new PatientRecordController();
