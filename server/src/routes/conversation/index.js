import express from 'express'
import conversationController from '../../controllers/conversation.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'
import { uploadFields } from '../../configs/multer.config.js'

const router = express.Router()
router.use(verifyToken)
router.get('/readConversationDetail/:conversationId', asyncHandler(conversationController.readConversationDetail))
router.post('/sendMessage', uploadFields, asyncHandler(conversationController.sendMessage))
router.get('/readConversations', asyncHandler(conversationController.readConversations))

export default router
