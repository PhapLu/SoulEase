import { useParams } from 'react-router-dom'
import '../../../pages/workSpace/conversation/Conversations.css'
import { useEffect, useState } from 'react'
import { apiUtils } from '../../../utils/newRequest'
import { useAuth } from '../../../contexts/auth/AuthContext'

export default function ConversationDetail() {
    const { conversationId } = useParams()
    const { userInfo } = useAuth()
    const [conversation, setConversation] = useState(null)

    useEffect(() => {
        const fetchConversationDetail = async () => {
            try {
                const response = await apiUtils.get(`/conversation/readConversationDetail/${conversationId}`)
                console.log('Fetched conversation detail:', response.data.metadata.conversation)
                setConversation(response.data.metadata.conversation)
            } catch (error) {
                console.error('Error fetching conversation detail:', error)
            }
        }
        fetchConversationDetail()
    }, [conversationId])

    if (!conversation) return <div>Loading...</div>

    // Determine chat partner's name
    const otherMembers = conversation.members.filter((m) => m.user._id !== userInfo._id)
    const displayName = otherMembers.map((m) => m.user.fullName).join(', ')

    return (
        <section className='ws-chat'>
            <header className='ws-chat__header'>
                <div className='ws-chat__avatar' />
                <div>
                    <div className='ws-chat__name'>{displayName}</div>
                    <div className='ws-chat__status'>Active now</div>
                </div>
            </header>

            <div className='ws-chat__body'>
                {conversation.messages.map((msg) => {
                    const isMe = msg.senderId === userInfo._id || msg.senderId?._id === userInfo._id

                    return (
                        <div key={msg._id} className={`ws-bubble ${isMe ? 'ws-bubble--me' : ''}`}>
                            {!isMe && <div className='ws-avatar-circle' />}
                            <p>{msg.content}</p>
                        </div>
                    )
                })}
            </div>

            <form className='ws-chat__input' onSubmit={(e) => e.preventDefault()}>
                <input type='text' placeholder='Type your message...' />
                <button>Send</button>
            </form>
        </section>
    )
}
