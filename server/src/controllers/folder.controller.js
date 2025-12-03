import FolderService from '../services/folder.service.js'
import { SuccessResponse } from '../core/success.response.js'

class FolderController {
    readFolders = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await FolderService.readFolders(req),
        }).send(res)
    }
    createFolder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await FolderService.createFolder(req),
        }).send(res)
    }
}

export default new FolderController()
