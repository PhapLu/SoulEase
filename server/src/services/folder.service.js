import PatientRecord from '../models/patientRecord.model.js'
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
        const folders = await Folder.find({ doctorId: userId }).sort({ createdAt: -1 })
        return { folders }
    }

    static readFolder = async (req) => {
        const userId = req.userId
        const folderId = req.params.folderId

        // 1. Check user, folder
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')
        const folder = await Folder.findOne({ _id: folderId, doctorId: userId }).populate({
            path: 'records',
            select: 'fullName email phone dob role',
        })
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

        // 1. Validate user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Validate folder ownership
        const existingFolder = await Folder.findOne({ _id: folderId, doctorId: userId })
        if (!existingFolder) throw new NotFoundError('Folder not found')

        // 3. Allowed updatable fields
        const allowedUpdates = ['title', 'description']
        const updateData = {}

        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key].trim?.() || req.body[key]
            }
        }

        // 4. Perform update & return full updated folder
        const updatedFolder = await Folder.findByIdAndUpdate(folderId, updateData, {
            new: true, // return updated document
            runValidators: true, // apply schema validation
        }).populate('records') // ensure folders return full records list

        return { folder: updatedFolder }
    }

    static deleteFolder = async (req) => {
        const userId = req.userId
        const folderId = req.params.folderId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Find folder (ensure ownership)
        const folder = await Folder.findOne({ _id: folderId, doctorId: userId })
        if (!folder) throw new NotFoundError('Folder not found')

        // Optional: prevent deleting archive folder itself
        if (folder.isArchived) throw new BadRequestError('Archived folder cannot be deleted')
        if (folder.doctorId.toString() !== userId) throw new BadRequestError('You do not have permission to delete this folder')

        // 3. If folder has records, move them into the archived folder
        const hasRecords = Array.isArray(folder.records) && folder.records.length > 0

        if (hasRecords) {
            console.log('HAS RECORDS')
            // 3.1 Find or create archived folder for this doctor
            let archivedFolder = await Folder.findOne({ doctorId: userId, isArchived: true })

            if (!archivedFolder) {
                archivedFolder = await Folder.create({
                    doctorId: userId,
                    title: 'Archived Records',
                    description: 'Automatically created archive folder',
                    isArchived: true,
                    records: [],
                })
            }

            // 3.2 Move records from current folder to archive
            archivedFolder.records.push(...folder.records)
            await archivedFolder.save()
        }

        // 4. Delete the original folder
        await folder.deleteOne()

        return { message: 'Folder deleted successfully' }
    }
}

export default FolderService
