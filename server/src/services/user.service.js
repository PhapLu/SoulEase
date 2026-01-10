import jwt from 'jsonwebtoken'
import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js'
import { decrypt } from '../configs/encryption.config.js'
import mongoose from 'mongoose'
import { User } from '../models/user.model.js'
import Order from '../models/order.model.js'
import { Upload } from '@aws-sdk/lib-storage'
import Conversation from '../models/conversation.model.js'
import Notification from '../models/notification.model.js'
import dotenv from 'dotenv'
import { s3 } from '../configs/s3.config.js'
dotenv.config()

const normalizeStaff = (u) => ({
    ...u.toObject(),
    speciality: u.doctorProfile?.speciality || '',
    assistDoctorId: u.nurseProfile?.assistDoctorId || null,
})

const COLLECTIONS = {
    Orders: Order,
    Users: User,
}

class UserService {
    static me = async (accessToken) => {
        // 1. Decode accessToken
        const decoded = jwt.verify(decrypt(accessToken), process.env.JWT_SECRET)
        if (!decoded?.id) throw new AuthFailureError('Invalid token')
        const userId = decoded.id.toString()
        // 2. Fetch user WITHOUT followers/following arrays
        const user = await User.findById(userId).select('-password -accessToken -googleId -followers -following')
        if (!user) throw new NotFoundError('Please login to continue')

        // 5. Fire-and-forget activity update
        User.updateOne({ _id: userId }, { $set: { 'activity.lastVisit': new Date() } }).exec()

        // 6. Return response
        return {
            user,
        }
    }

    static createStaff = async (req) => {
        const clinicId = req.userId
        const { fullName, phoneNumber, email, specialty, role, assistDoctorId } = req.body

        // 1. Validate clinic
        const clinic = await User.findById(clinicId)
        if (!clinic || clinic.role !== 'clinic') {
            throw new AuthFailureError('Only clinics can create staff')
        }

        if (!clinic.defaultPassword || clinic.defaultPassword.trim() === '') {
            throw new BadRequestError('Clinic default password is not set')
        }

        // 2. Validate role
        if (!['doctor', 'nurse'].includes(role)) {
            throw new BadRequestError('Invalid staff role')
        }

        // 3. Email uniqueness
        const existingUser = await User.findOne({ email })
        if (existingUser) throw new BadRequestError('Email already exists')

        // 4. Validate nurse → doctor
        let assignedDoctor = null

        if (role === 'nurse') {
            if (!assistDoctorId) throw new BadRequestError('Nurse must be assigned to a doctor')

            assignedDoctor = await User.findOne({
                _id: assistDoctorId,
                role: 'doctor',
                clinicId, // 🔒 same clinic
            })

            if (!assignedDoctor) throw new NotFoundError('Assigned doctor not found')
        }

        // 5. Create staff user (FIXED)
        const staffData = {
            fullName,
            email,
            phone: phoneNumber,
            role,
            clinicId, // ✅ THIS IS THE IMPORTANT PART
            status: 'active',
            password: clinic.defaultPassword,
        }

        if (role === 'doctor') {
            staffData.doctorProfile = {
                speciality: specialty || '',
            }
        }

        if (role === 'nurse') {
            staffData.nurseProfile = {
                assistDoctorId,
            }
        }

        const staff = await User.create(staffData)

        // 6. Create archived folder for doctor
        if (role === 'doctor') {
            await Folder.create({
                title: 'Archived',
                description: 'System-generated archived folder',
                doctorId: staff._id,
            })
        }

        // 7. Create conversations

        // Clinic ↔ Staff
        await Conversation.create({
            members: [{ user: clinicId }, { user: staff._id }],
            messages: [
                {
                    senderId: clinicId,
                    content: `Welcome ${staff.fullName}! This is your private chat with the clinic.`,
                    createdAt: new Date(),
                    seenBy: [clinicId],
                },
            ],
        })

        // Doctor ↔ Nurse
        if (role === 'nurse' && assignedDoctor) {
            await Conversation.create({
                members: [{ user: assignedDoctor._id }, { user: staff._id }],
                messages: [
                    {
                        senderId: assignedDoctor._id,
                        content: `Welcome ${staff.fullName}! This is your private chat with Dr. ${assignedDoctor.fullName}.`,
                        createdAt: new Date(),
                        seenBy: [assignedDoctor._id],
                    },
                ],
            })
        }

        // 8. Return safe payload
        const createdStaff = await User.findById(staff._id).select('-password -accessToken -defaultPassword')

        return {
            staff: createdStaff,
        }
    }

    static meMobile = async (accessToken) => {
        // 1. Decode accessToken and check
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
        if (!decoded) throw new AuthFailureError('Invalid token')

        // 2. Find user
        const userId = decoded.id
        if (!userId) throw new AuthFailureError('Invalid validation')

        // 3. Return user without password
        const user = await User.findById(userId).select('-password -accessToken -googleId').populate('followers', 'avatar fullName domainName').populate('following', 'avatar fullName domainName')
        if (!user) throw new NotFoundError('Please login to continue')

        //4. Update user activity visit
        user.activity.lastVisit = new Date()
        await user.save()

        // Fetch unseen notifications
        const unSeenNotifications = await Notification.find({
            receiverId: new mongoose.Types.ObjectId(userId),
            isSeen: false,
        })

        // Convert user to plain object
        const userData = user.toObject()

        // Remove pinCode from userData
        delete userData.pinCode

        // Add additional properties
        userData.unSeenConversations = filteredUnSeenConversations
        userData.unSeenNotifications = unSeenNotifications

        return {
            user: { ...userData, hasSetPinCode },
        }
    }

    static readStaffs = async (req) => {
        const clinicId = req.userId

        // 1. Check clinic
        const clinic = await User.findById(clinicId)
        if (!clinic) throw new NotFoundError('Clinic not found')
        if (clinic.role !== 'clinic') throw new AuthFailureError('You are not authorized to perform this action')

        // 2. Find doctors associated with the clinic
        const staffs = await User.find({
            clinicId: clinicId,
            role: { $in: ['doctor', 'nurse'] },
        }).select('-password -accessToken -googleId -followers -following')

        // 3. Return doctors list
        return {
            staffs: staffs.map(normalizeStaff),
        }
    }

    static readStaffDetail = async (req) => {
        const staffId = req.params.staffId

        // 1. Check doctor
        const staff = await User.findById(staffId).select('-password -accessToken -googleId -followers -following')
        if (!staff || (staff.role !== 'doctor' && staff.role !== 'nurse')) throw new NotFoundError('Staff not found')

        // 2. Return doctor detail
        return {
            user: normalizeStaff(staff),
        }
    }

    static readUserProfile = async (req) => {
        const userId = req.userId
        const targetId = req.params?.userId || userId

        if (targetId.toString() !== userId.toString()) {
            throw new AuthFailureError('You are not authorized to view this profile')
        }
        // 1. Check user
        const user = await User.findById(targetId).select('-password -accessToken -googleId -followers -following')
        if (!user) throw new NotFoundError('User not found')
        // 2. Return user profile
        return {
            user,
        }
    }

    static updateUserProfile = async (req) => {
        const userId = req.userId
        const targetId = req.params?.userId || userId
        const updateData = req.body

        // 1. Check user
        if (targetId.toString() !== userId.toString()) {
            throw new AuthFailureError('You are not authorized to update this profile')
        }
        const user = await User.findById(targetId)
        if (!user) throw new NotFoundError('User not found')

        // 2. Update user profile
        const allowed = ['fullName', 'phone', 'address', 'gender', 'dob', 'avatar']

        allowed.forEach((key) => {
            if (updateData[key] !== undefined) {
                user[key] = updateData[key]
            }
        })

        if ((user.role === 'clinic' || user.role === 'doctor') && updateData.defaultPassword !== undefined) {
            const nextDefault = String(updateData.defaultPassword).trim()
            if (nextDefault) {
                user.defaultPassword = nextDefault
            }
        }

        if (user.role === 'doctor' && updateData.doctorProfile) {
            user.doctorProfile = {
                ...(user.doctorProfile || {}),
                ...updateData.doctorProfile,
            }
        }

        if (user.role === 'clinic' && updateData.clinicProfile) {
            user.clinicProfile = {
                ...(user.clinicProfile || {}),
                ...updateData.clinicProfile,
            }
        }

        if (user.role === 'nurse' && updateData.nurseProfile) {
            user.nurseProfile = {
                ...(user.nurseProfile || {}),
                ...updateData.nurseProfile,
            }
        }

        await user.save()

        // 3. Return updated user without sensitive info
        const updatedUser = await User.findById(userId).select('-password -accessToken -googleId -followers -following')
        return {
            user: updatedUser,
        }
    }

    static changePassword = async (req) => {
        const userId = req.userId
        const targetId = req.params?.userId || userId
        const { oldPassword, newPassword } = req.body || {}

        if (targetId.toString() !== userId.toString()) {
            throw new AuthFailureError('You are not authorized to change this password')
        }
        if (!oldPassword || !newPassword) throw new BadRequestError('Old and new password are required')

        const user = await User.findById(targetId).select('password')
        if (!user) throw new NotFoundError('User not found')

        if (String(user.password) !== String(oldPassword)) {
            throw new AuthFailureError('Old password is incorrect')
        }

        user.password = String(newPassword).trim()
        await user.save()

        return { success: true }
    }

    static updateStaffInfo = async (req) => {
        const requesterId = req.userId
        const { staffId } = req.params
        const payload = req.body

        // 1. Validate staff exists
        const staff = await User.findById(staffId)
        if (!staff) {
            throw new NotFoundError('Staff not found')
        }

        // 2. Validate requester exists
        const requester = await User.findById(requesterId)
        if (!requester) {
            throw new NotFoundError('User not found')
        }

        // 3. Authorization check
        const isOwner = staff._id.toString() === requesterId.toString()
        const isClinicOwner = requester.role === 'clinic' && staff.clinicId && staff.clinicId.toString() === requesterId.toString()

        if (!isOwner && !isClinicOwner) {
            throw new AuthFailureError('You are not authorized to update this staff information')
        }

        // 4. Allowed fields (VERY IMPORTANT – prevent privilege escalation)
        const updateData = {}

        // shared fields
        if (payload.fullName) updateData.fullName = payload.fullName
        if (payload.email) updateData.email = payload.email
        if (payload.phone) updateData.phone = payload.phone
        if (payload.address) updateData.address = payload.address
        if (payload.gender) updateData.gender = payload.gender
        if (payload.dob) updateData.dob = payload.dob

        // role-specific
        if (staff.role === 'doctor' && payload.speciality !== undefined) {
            updateData['doctorProfile.speciality'] = payload.speciality
        }

        if (staff.role === 'nurse' && payload.assistDoctorId !== undefined) {
            updateData['nurseProfile.assistDoctorId'] = payload.assistDoctorId
        }

        // 5. Update staff
        const updatedStaff = await User.findByIdAndUpdate(
            staffId,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
            }
        ).select('-password -accessToken -googleId -followers -following')

        // 6. Return safe response
        return {
            staff: normalizeStaff(updatedStaff),
        }
    }

    static updateAvatar = async (req) => {
        const userId = req.userId
        const file = req.file

        if (!file) throw new BadRequestError('Avatar file is required')
        if (!file.mimetype.startsWith('image/')) throw new BadRequestError('Only image files are allowed')

        // 1️. Generate S3 key
        const ext = file.originalname.split('.').pop()
        const key = `${userId}-${Date.now()}.${ext}`

        // 2️. Upload directly to S3 (no helper)
        const upload = new Upload({
            client: s3,
            params: {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            },
        })

        await upload.done()

        // 3️. Build CloudFront URL
        const avatarUrl = `${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`

        // 4️. Save to DB
        const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true })

        return {
            message: 'Avatar updated successfully',
            avatar: user.avatar,
        }
    }
}

export default UserService
