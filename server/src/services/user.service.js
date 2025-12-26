import jwt from 'jsonwebtoken'
import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js'
import { decrypt } from '../configs/encryption.config.js'
import mongoose from 'mongoose'
import { User } from '../models/user.model.js'
import Order from '../models/order.model.js'
import Conversation from '../models/conversation.model.js'
import Notification from '../models/notification.model.js'
import dotenv from 'dotenv'
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

        const clinic = await User.findById(clinicId)
        if (!clinic || clinic.role !== 'clinic') {
            throw new AuthFailureError('Only clinics can create staff')
        }

        if (!['doctor', 'nurse'].includes(role)) {
            throw new BadRequestError('Invalid staff role')
        }

        if (role === 'nurse') {
            if (!assistDoctorId) {
                throw new BadRequestError('Nurse must be assigned to a doctor')
            }

            const doctor = await User.findOne({
                _id: assistDoctorId,
                role: 'doctor',
                clinicId,
            })

            if (!doctor) {
                throw new NotFoundError('Assigned doctor not found')
            }
        }

        const staffData = {
            fullName,
            phone: phoneNumber,
            email,
            role,
            clinicId,
            status: 'active',
            password: 'staffPassword@123', // ⚠️ still risky, see note below
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

        const createdStaff = await User.findById(staff._id).select('-password -accessToken -googleId -followers -following')

        return {
            staff: normalizeStaff(createdStaff),
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
        // 1. Check user
        const user = await User.findById(userId).select('-password -accessToken -googleId -followers -following')
        if (!user) throw new NotFoundError('User not found')
        // 2. Return user profile
        return {
            user,
        }
    }

    static updateUserProfile = async (req) => {
        const userId = req.userId
        const updateData = req.body

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new NotFoundError('User not found')

        // 2. Update user profile
    }

    static updateUserProfile = async (req) => {
        const userId = req.userId
        const updateData = req.body

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new NotFoundError('User not found')

        // 2. Update user profile
        const allowed = ['fullName', 'phone', 'address', 'gender', 'dob', 'avatar']

        allowed.forEach((key) => {
            if (updateData[key] !== undefined) {
                user[key] = updateData[key]
            }
        })

        await user.save()

        // 3. Return updated user without sensitive info
        const updatedUser = await User.findById(userId).select('-password -accessToken -googleId -followers -following')
        return {
            user: updatedUser,
        }
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
}

export default UserService
