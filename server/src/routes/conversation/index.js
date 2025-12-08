import express from 'express'
import conversationController from '../../controllers/conversation.controller.js'
import { asyncHandler } from '../../auth/checkAuth.js'
import { verifyToken } from '../../middlewares/jwt.js'

const router = express.Router()
router.use(verifyToken)
router.get('/readConversation/:patientId', asyncHandler(conversationController.readConversation))
router.post('/createConversation', asyncHandler(conversationController.createConversation))
router.get('/readConversations', asyncHandler(conversationController.readConversations))
router.patch('/updateConversation', asyncHandler(conversationController.updateConversation))
router.delete('/deleteConversation', asyncHandler(conversationController.deleteConversation))

export default router
