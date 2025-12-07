import FolderService from '../services/folder.service.js'
import { SuccessResponse } from '../core/success.response.js'

class FolderController {
    readFolder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await FolderService.readFolder(req),
        }).send(res)
    }

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
    updateFolder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await FolderService.updateFolder(req),
        }).send(res)
    }
    deleteFolder = async (req, res, next) => {
        new SuccessResponse({
            message: 'Me success!',
            metadata: await FolderService.deleteFolder(req),
        }).send(res)
    }
}

export default new FolderController()
