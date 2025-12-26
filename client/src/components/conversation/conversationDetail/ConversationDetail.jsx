import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiUtils } from '../../../utils/newRequest'
import { useAuth } from '../../../contexts/auth/AuthContext'

export default function ConversationDetail() {
    const { conversationId } = useParams()
    const { userInfo, socket } = useAuth()

    const [conversation, setConversation] = useState(null)
    const [newMsg, setNewMsg] = useState('')
    const [mediaFile, setMediaFile] = useState(null)

    // -----------------------------
    // Load conversation
    // -----------------------------
    useEffect(() => {
        const fetchConversationDetail = async () => {
            try {
                const response = await apiUtils.get(`/conversation/readConversationDetail/${conversationId}`)
                setConversation(response.data.metadata.conversation)
            } catch (error) {
                console.error('Error fetching conversation detail:', error)
            }
        }
        fetchConversationDetail()
    }, [conversationId])

    // -----------------------------
    // SOCKET: Receive incoming message
    // -----------------------------
    useEffect(() => {
        if (!socket) return
        const handler = (msg) => {
            if (msg.conversationId === conversationId) {
                setConversation((prev) => ({
                    ...prev,
                    messages: [...prev.messages, msg],
                }))
            }
        }
        socket.on('getMessage', handler)

        return () => socket.off('getMessage', handler)
    }, [socket, conversationId])

    // -----------------------------
    // SEND MESSAGE (TEXT + FILE)
    // -----------------------------
    const handleSend = async (e) => {
        e.preventDefault()

        if (!newMsg.trim() && !mediaFile) return

        try {
            const formData = new FormData()
            formData.append('conversationId', conversationId)
            formData.append('content', newMsg)
            if (mediaFile) formData.append('files', mediaFile)

            const res = await apiUtils.post('/conversation/sendMessage', formData)

            const saved = res.data.metadata.newMessage

            // Update UI
            setConversation((prev) => ({
                ...prev,
                messages: [...prev.messages, saved],
            }))

            // Emit via socket
            socket.emit('sendMessage', {
                ...saved,
                conversationId,
            })

            // Reset input
            setNewMsg('')
            setMediaFile(null)
        } catch (err) {
            console.error('Send message error:', err)
        }
    }

    if (!conversation) return <div>Loading...</div>

    const otherMembers = conversation.members.filter((m) => m.user._id !== userInfo._id)
    const displayName = otherMembers.map((m) => m.user.fullName).join(', ')

    return (
        <section className='ws-chat'>
            <header className='ws-chat__header'>
                <img src={conversation?.thumbnail} className='ws-chat__avatar' />
                <div>
                    <div className='ws-chat__name'>{displayName}</div>
                    <div className='ws-chat__status'>Active now</div>
                </div>
            </header>

            <div className='ws-chat__body'>
                {conversation.messages.map((msg) => {
                    const isMe = msg.senderId === userInfo._id || msg.senderId?._id === userInfo._id
                    return (
                        <div key={msg._id || crypto.randomUUID()} className={`ws-bubble ${isMe ? 'ws-bubble--me' : ''}`}>
                            {!isMe && <div className='ws-avatar-circle' />}
                            {msg.content && <p>{msg.content}</p>}
                            {msg.media?.length > 0 && <img src={msg.media[0]} className='ws-chat-img' alt='attachment' />}
                        </div>
                    )
                })}
            </div>

            <form className='ws-chat__input' onSubmit={handleSend}>
                <input type='text' placeholder='Type your message...' value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />

                {/* <input type='file' accept='image/*,video/*' onChange={(e) => setMediaFile(e.target.files[0])} /> */}

                <button>Send</button>
            </form>
        </section>
    )
}
