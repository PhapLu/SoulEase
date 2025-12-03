import express from 'express'
import folderController from '../../controllers/folder.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.use(verifyToken)
router.get('/readFolders', asyncHandler(folderController.readFolders))
router.post('/createFolder', asyncHandler(folderController.createFolder))

export default router
