import express from 'express'
import authRoute from './auth/index.js'
import userRoute from './user/index.js'
import folderRoute from './folder/index.js'
import patientRecordRoute from './patientRecord/index.js'
import conversationRoute from './conversation/index.js'

const router = express.Router()

//Check Permission
router.use('/v1/api/auth', authRoute)
router.use('/v1/api/user', userRoute)
router.use('/v1/api/folder', folderRoute)
router.use('/v1/api/patientRecord', patientRecordRoute)
router.use('/v1/api/conversation', conversationRoute)

export default router
