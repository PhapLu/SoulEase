import WorkspaceTopBar from '../../../components/Workspace/WorkspaceTopBar'
import AssistantPanel from '../../../components/conversation/assistantPanel/AssistantPanel'
import { useParams } from 'react-router-dom'
import ConversationDetail from '../../../components/conversation/conversationDetail/ConversationDetail'
import './Conversations.css'
import MessagesList from '../../../components/conversation/messagesList/MessageList'

export default function ConversationsLayout() {
    const { conversationId } = useParams()

    return (
        <div className='ws-messages'>
            <WorkspaceTopBar />

            <div className='ws-panels'>
                {/* LEFT PANEL */}
                <aside className='ws-left-panel'>
                    <MessagesList />
                </aside>

                {/* CENTER PANEL — controlled by layout */}
                <section className='ws-center-panel'>
                    {conversationId ? (
                        <ConversationDetail conversationId={conversationId} />
                    ) : (
                        <div className='ws-empty'>
                            <div className='ws-empty__card'>
                                <h3>SoulEase xin chào</h3>
                                <p>Choose a chat on the left to view messages and talk with your patient.</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* RIGHT PANEL */}
                <aside className='ws-right-panel'>
                    <AssistantPanel />
                </aside>
            </div>
        </div>
    )
}
