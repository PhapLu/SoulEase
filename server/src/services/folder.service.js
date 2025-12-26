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
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Validate inputs
        if (!title || title.trim() === '') {
            throw new BadRequestError('Folder title is required')
        }

        // 3. Create folder
        let newFolder
        if (user.role == 'doctor') {
            newFolder = new Folder({
                title,
                description: description ? description.trim() : '',
                doctorId: userId,
            })
            await newFolder.save()
        } else if (user.role == 'nurse') {
            newFolder = new Folder({
                title,
                description: description ? description.trim() : '',
                doctorId: user.nurseProfile.assistDoctorId,
            })
            await newFolder.save()
        } else {
            throw new AuthFailureError('You do not have permission to access folders')
        }

        return { folder: newFolder }
    }

    static readFolders = async (req) => {
        const userId = req.userId

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        // 2. Fetch folders
        let folders
        if (user.role == 'nurse') {
            const doctorId = user.nurseProfile.assistDoctorId
            folders = await Folder.find({ doctorId: doctorId }).sort({ createdAt: -1 })
        } else if (user.role == 'doctor') {
            folders = await Folder.find({ doctorId: userId }).sort({ createdAt: -1 })
        } else {
            throw new AuthFailureError('You do not have permission to access folders')
        }

        return { folders }
    }

    static readFolder = async (req) => {
        const userId = req.userId
        const folderId = req.params.folderId

        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        let doctorId
        if (user.role === 'doctor') {
            doctorId = userId
        } else if (user.role === 'nurse') {
            doctorId = user.nurseProfile.assistDoctorId
        } else {
            throw new AuthFailureError('You do not have permission to access folders')
        }

        const folder = await Folder.findOne({
            _id: folderId,
            doctorId,
        }).populate({
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

        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        let doctorId
        if (user.role === 'doctor') {
            doctorId = userId
        } else if (user.role === 'nurse') {
            doctorId = user.nurseProfile.assistDoctorId
        } else {
            throw new AuthFailureError('You do not have permission to access folders')
        }

        const folder = await Folder.findOne({ _id: folderId, doctorId })
        if (!folder) throw new NotFoundError('Folder not found')

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

        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        let doctorId
        if (user.role === 'doctor') {
            doctorId = userId
        } else if (user.role === 'nurse') {
            doctorId = user.nurseProfile.assistDoctorId
        } else {
            throw new AuthFailureError('You do not have permission to access folders')
        }

        const existingFolder = await Folder.findOne({ _id: folderId, doctorId })
        if (!existingFolder) throw new NotFoundError('Folder not found')

        const updateData = {}
        if (req.body.title !== undefined) updateData.title = req.body.title.trim()
        if (req.body.description !== undefined) updateData.description = req.body.description.trim()

        const updatedFolder = await Folder.findByIdAndUpdate(folderId, updateData, {
            new: true,
            runValidators: true,
        }).populate('records')

        return { folder: updatedFolder }
    }

    static deleteFolder = async (req) => {
        const userId = req.userId
        const folderId = req.params.folderId

        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('Please login to continue')

        let doctorId
        if (user.role === 'doctor') {
            doctorId = userId
        } else if (user.role === 'nurse') {
            doctorId = user.nurseProfile.assistDoctorId
        } else {
            throw new AuthFailureError('You do not have permission to access folders')
        }

        const folder = await Folder.findOne({ _id: folderId, doctorId })
        if (!folder) throw new NotFoundError('Folder not found')

        if (folder.isArchived) {
            throw new BadRequestError('Archived folder cannot be deleted')
        }

        const hasRecords = folder.records.length > 0

        if (hasRecords) {
            let archivedFolder = await Folder.findOne({
                doctorId,
                isArchived: true,
            })

            if (!archivedFolder) {
                archivedFolder = await Folder.create({
                    doctorId,
                    title: 'Archived Records',
                    description: 'Automatically created archive folder',
                    isArchived: true,
                    records: [],
                })
            }

            archivedFolder.records.push(...folder.records)
            await archivedFolder.save()
        }

        await folder.deleteOne()

        return { message: 'Folder deleted successfully' }
    }
}

export default FolderService
