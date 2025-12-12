import jwt from 'jsonwebtoken'
import { AuthFailureError, NotFoundError } from '../core/error.response.js'
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

    static createDoctor = async (req) => {
        const clinicId = req.userId
        const { fullName, phoneNumber, email, specialty, description } = req.body

        // 1. Check clinic
        const clinic = await User.findById(clinicId)
        if (!clinic) throw new NotFoundError('Clinic not found')
        if (clinic.role !== 'clinic') throw new AuthFailureError('You are not authorized to perform this action')

        // 2. Create new doctor
        const newDoctor = new User({
            fullName,
            phone: phoneNumber,
            email,
            specialty: specialty || '',
            description: description || '',
            role: 'doctor',
            clinicId: clinicId,
        })
        await newDoctor.save()

        // 3. Return created doctor without sensitive info
        const createdDoctor = await User.findById(newDoctor._id).select('-password -accessToken -googleId -followers -following')
        return {
            doctor: createdDoctor,
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

    static readDoctors = async (req) => {
        const clinicId = req.userId

        // 1. Check clinic
        const clinic = await User.findById(clinicId)
        if (!clinic) throw new NotFoundError('Clinic not found')
        if (clinic.role !== 'clinic') throw new AuthFailureError('You are not authorized to perform this action')

        // 2. Find doctors associated with the clinic
        const doctors = await User.find({ clinicId: clinicId, role: 'doctor' }).select('-password -accessToken -googleId -followers -following')

        // 3. Return doctors list
        return {
            doctors,
        }
    }

    static readDoctorDetail = async (req) => {
        const doctorId = req.params.doctorId

        // 1. Check doctor
        const doctor = await User.findById(doctorId).select('-password -accessToken -googleId -followers -following')
        if (!doctor || doctor.role !== 'doctor') throw new NotFoundError('Doctor not found')

        // 2. Return doctor detail

        return {
            user: doctor,
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
