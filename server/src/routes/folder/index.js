import express from 'express'
import folderController from '../../controllers/folder.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

//signUp
router.post('/createFolder', asyncHandler(folderController.createFolder))

export default router
