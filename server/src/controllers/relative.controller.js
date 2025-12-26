import RelativeService from '../services/relative.service.js'
import { SuccessResponse } from '../core/success.response.js'

class RelativeController {
    createRelativeAccount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create relative success',
            metadata: await RelativeService.createRelativeAccount(req),
        }).send(res)
    }

    readRelatives = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read relatives success',
            metadata: await RelativeService.readRelatives(req),
        }).send(res)
    }

    readMyPatientRecord = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read my patient record success',
            metadata: await RelativeService.readMyPatientRecord(req),
        }).send(res)
    }
}

export default new RelativeController()
