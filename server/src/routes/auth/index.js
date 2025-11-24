import express from 'express'
import authController from '../../controllers/auth.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

//signUp
router.post('/auth/signUp', asyncHandler(authController.signUp))
router.post('/auth/login', asyncHandler(authController.login))
router.post('/auth/verifyOtp', asyncHandler(authController.verifyOtp))
router.post('/auth/logout', asyncHandler(authController.logout))
router.post('/auth/forgotPassword', asyncHandler(authController.forgotPassword))
router.post('/auth/verifyResetPasswordOtp', asyncHandler(authController.verifyResetPasswordOtp))
router.patch('/auth/resetPassword', asyncHandler(authController.resetPassword))

//MOBILE
router.post('/users/loginMobile', asyncHandler(authController.loginMobile))
router.post('/users/logoutMobile', asyncHandler(authController.logoutMobile))

export default router
