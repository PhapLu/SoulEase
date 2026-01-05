import WorkspaceTopBar from '../../../components/Workspace/WorkspaceTopBar'
import AssistantPanel from '../../../components/conversation/assistantPanel/AssistantPanel'
import { useParams } from 'react-router-dom'
import ConversationDetail from '../../../components/conversation/conversationDetail/ConversationDetail'
import './Conversations.css'
import Conversations from '../../../components/conversation/conversations/Conversations'
import { useEffect, useState } from 'react'
import { apiUtils } from '../../../utils/newRequest'
import { useAuth } from '../../../contexts/auth/AuthContext'

export default function ConversationsLayout() {
    const { conversationId } = useParams()
    const hasConversation = !!conversationId
    const { userInfo } = useAuth()

    return (
        <div className='ws-messages'>
            <WorkspaceTopBar />

            <div className={`ws-panels ${hasConversation ? '' : 'ws-panels--no-chat'}`}>
                {/* LEFT PANEL */}
                <aside className='ws-left-panel'>
                    <Conversations />
                </aside>

                {/* CENTER PANEL — controlled by layout */}
                <section className='ws-center-panel'>
                    {conversationId ? (
                        <ConversationDetail conversationId={conversationId} />
                    ) : (
                        <div className='ws-empty'>
                            <div className='ws-empty__card'>
                                <h3>Hello {userInfo?.role === 'clinic' ? 'Clinic' : 'Doctor'}</h3>
                                <p>Choose a conversation on the left to view messages and start chatting.</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* RIGHT PANEL */}
                {hasConversation ? (
                    <aside className='ws-right-panel'>
                        <AssistantPanel />
                    </aside>
                ) : null}
            </div>
        </div>
    )
}
