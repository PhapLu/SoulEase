import Folder from '../models/folder.model.js'
import { User } from '../models/user.model.js'
import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js'
import dotenv from 'dotenv'
dotenv.config()

class FolderService {
    static createFolder = async (req) => {
        const userId = req.userId
        const { title, description } = req.body

        // 1. Check user
        const user = await User.findById(userId)
        console.log(userId)
        console.log(req.body)
        console.log(user)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Validate inputs
        if (!title || title.trim() === '') {
            throw new BadRequestError('Folder title is required')
        }
        // 3. Create folder
        const newFolder = new Folder({
            title,
            description: description ? description.trim() : '',
            doctorId: userId,
        })
        await newFolder.save()

        return { folder: newFolder }
    }

    static readFolders = async (req) => {
        const userId = req.userId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Fetch folders
        const folders = await Folder.find({ doctorId: userId, isArchived: false }).sort({ createdAt: 1 })
        return { folders }
    }

    static readFolder = async (req) => {
        const userId = req.userId
        const folderId = req.params.folderId

        // 1. Check user, folder
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')
        const folder = await Folder.findOne({ _id: folderId, doctorId: userId })
        if (!folder) throw new NotFoundError('Folder not found')

        return { folder }
    }

    static addPatientRecordToFolder = async (req) => {
        const userId = req.userId
        const folderId = req.params.folderId
        const { recordId } = req.body

        // 1. Check user, folder
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')
        const folder = await Folder.findOne({ _id: folderId, doctorId: userId })
        if (!folder) throw new NotFoundError('Folder not found')

        // 2. Add record to folder if not already present
        if (folder.records.includes(recordId)) {
            throw new BadRequestError('Record already exists in the folder')
        }
        folder.records.push(recordId)
        await folder.save()
        return { folder }
    }

    static updateFolder = async (req) => {
        const userId = req.userId
        const folderId = req.params.folderId
        const { title, description } = req.body

        // 1. Check user, folder
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')
        const folder = await Folder.findOne({ _id: folderId, doctorId: userId })
        if (!folder) throw new NotFoundError('Folder not found')

        // 2. Update folder details
        if (title && title.trim() !== '') {
            folder.title = title.trim()
        }
        if (description) {
            folder.description = description.trim()
        }
        await folder.save()
        return { folder }
    }

    static deleteFolder = async (req) => {
        const userId = req.userId
        const folderId = req.params.folderId

        // 1. Check user, folder
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')
        const folder = await Folder.findOne({ _id: folderId, doctorId: userId })
        if (!folder) throw new NotFoundError('Folder not found')

        // 2. Delete folder
        folder.deleteOne()

        return { message: 'Folder deleted successfully' }
    }
}

export default FolderService
