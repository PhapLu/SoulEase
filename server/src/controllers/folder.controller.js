import FolderService from '../services/folder.service.js'
import { SuccessResponse } from '../core/success.response.js'
import { BadRequestError } from '../core/error.response.js'

class FolderController {
    createFolder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await FolderService.createFolder(req),
        }).send(res)
    }
}

export default new FolderController()
