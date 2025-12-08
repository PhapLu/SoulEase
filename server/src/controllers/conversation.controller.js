import { SuccessResponse } from '../core/success.response.js'
import ConversationService from '../services/conversation.service.js'

class ControllerController {
    readConversationWithOtherMember = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read conversation success!',
            metadata: await ConversationService.readConversationWithOtherMember(req.userId, req.params.otherMemberId),
        }).send(res)
    }

    readConversations = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read conversations success!',
            metadata: await ConversationService.readConversations(req.userId),
        }).send(res)
    }

    sendMessage = async (req, res, next) => {
        new SuccessResponse({
            message: 'Send message success!',
            metadata: await ConversationService.sendMessage(req),
        }).send(res)
    }

    readMobileConversation = async (req, res, next) => {
        new SuccessResponse({
            message: 'Read conversation success!',
            metadata: await ConversationService.readMobileConversation(req.userId, req.params.conversationId, req),
        }).send(res)
    }
}

export default new ControllerController()
