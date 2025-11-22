import express from 'express'
import authRoute from './auth/index.js'

const router = express.Router()

//Check Permission
router.use('/v1/api/auth', authRoute)

export default router
