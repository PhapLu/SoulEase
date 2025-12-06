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
router.patch('/updateFolder/:folderId', asyncHandler(folderController.updateFolder))
router.delete('/deleteFolder/:folderId', asyncHandler(folderController.deleteFolder))

export default router
