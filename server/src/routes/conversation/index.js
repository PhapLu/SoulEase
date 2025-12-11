import express from 'express'
import conversationController from '../../controllers/conversation.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'

const router = express.Router()
router.use(verifyToken)
router.get('/readConversationDetail/:conversationId', asyncHandler(conversationController.readConversationDetail))
router.get('/readConversations', asyncHandler(conversationController.readConversations))
router.delete('/deleteConversation', asyncHandler(conversationController.deleteConversation))

export default router
