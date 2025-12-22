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

        // 1. Check clinic
        const clinic = await User.findById(clinicId)
        if (!clinic) throw new NotFoundError('Clinic not found')
        if (clinic.role !== 'clinic') {
            throw new AuthFailureError('Only clinics can create staff')
        }

        // 2. Validate role
        if (!['doctor', 'nurse'].includes(role)) {
            throw new BadRequestError('Invalid staff role')
        }

        // 3. Nurse must be assigned to a doctor
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

        // 4. Create staff
        const staff = await User.create({
            fullName,
            phone: phoneNumber,
            email,
            speciality: specialty || '',
            role,
            clinicId,
            assistDoctorId: role === 'nurse' ? assistDoctorId : null,
            status: 'active',
            password: 'staffPassword@123',
        })

        // 5. Return safe payload
        const createdStaff = await User.findById(staff._id).select('-password -accessToken -googleId')

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

        // 5. Determine hasSetPinCode before removing pinCode
        let hasSetPinCode = false
        if (user.pinCode) {
            hasSetPinCode = true
        }

        // Fetch unseen conversations
        // Fetch unseen conversations
        const unSeenConversations = await Conversation.find({
            members: { $elemMatch: { user: userId } },
        })
            .populate('members.user messages.senderId')
            .lean()

        const filteredUnSeenConversations = unSeenConversations.filter((conversation) => {
            const last = conversation.messages?.[conversation.messages.length - 1]
            if (!last) return false

            const senderId = last.senderId && last.senderId._id ? last.senderId._id.toString() : last.senderId?.toString()

            const seenBy = (last.seenBy || []).map((id) => id.toString())
            const me = userId.toString()

            return senderId !== me && !seenBy.includes(me)
        })

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
            staffs,
        }
    }

    static readDoctors = async (req) => {
        const clinicId = req.userId

        // 1. Check clinic
        const clinic = await User.findById(clinicId)
        if (!clinic) throw new NotFoundError('Clinic not found')
        if (clinic.role !== 'clinic') throw new AuthFailureError('You are not authorized to perform this action')

        // 2. Find doctors associated with the clinic
        const doctors = await User.find({
            clinicId: clinicId,
            role: 'doctor',
        }).select('-password -accessToken -googleId -followers -following')

        // 3. Return doctors list
        return {
            doctors,
        }
    }

    static readStaffDetail = async (req) => {
        const staffId = req.params.staffId

        // 1. Check doctor
        const staff = await User.findById(staffId).select('-password -accessToken -googleId -followers -following')
        if (!staff || (staff.role !== 'doctor' && staff.role !== 'nurse')) throw new NotFoundError('Staff not found')

        // 2. Return doctor detail
        return {
            user: staff,
        }
    }

    static updateUserProfile = async (req) => {
        const userId = req.userId
        const updateData = req.body

        // 1. Check user
        const user = await User.findById(userId)
        if (!user) throw new NotFoundError('User not found')

        // 2. Update user profile
        Object.keys(updateData).forEach((key) => {
            user[key] = updateData[key]
        })
        await user.save()

        // 3. Return updated user without sensitive info
        const updatedUser = await User.findById(userId).select('-password -accessToken -googleId -followers -following')
        return {
            user: updatedUser,
        }
    }
}

export default UserService
