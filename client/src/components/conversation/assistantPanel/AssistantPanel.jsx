// src/components/conversation/assistantPanel/AssistantPanel.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Soulra from '../../../assets/icons/Soulra.svg'
import { pythonApiUtils } from '../../../utils/pythonRequest'
import { apiUtils } from '../../../utils/newRequest'
import { useAuth } from '../../../contexts/auth/AuthContext'
import '../../../pages/workSpace/conversation/Conversations.css'

export default function AssistantPanel() {
    const { conversationId } = useParams() // This is the patient/conversation ID
    const { userInfo } = useAuth()

    const [text, setText] = useState('')
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [viewMode, setViewMode] = useState('profile') // profile | ai
    const [contactInfo, setContactInfo] = useState(null)
    const messagesEndRef = useRef(null)

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Reset to profile when switching conversation
    useEffect(() => {
        setViewMode('profile')
    }, [conversationId])

    // Load AI history when patient changes
    useEffect(() => {
        if (!conversationId) {
            setMessages([])
            return
        }

        const loadHistory = async () => {
            setIsLoading(true)
            try {
                const res = await pythonApiUtils.get(`/ai-history/${conversationId}`)
                const loaded = res.data.messages || []
                const formatted = loaded.map((m) => ({
                    sender: m.sender,
                    text: m.text,
                }))
                setMessages(formatted.length > 0 ? formatted : [{ sender: 'ai', text: 'Hello! How may I help?' }])
            } catch (err) {
                console.error('Load AI history error:', err)
                setMessages([{ sender: 'ai', text: 'Hello! How may I help?' }])
            } finally {
                setIsLoading(false)
            }
        }

        loadHistory()
    }, [conversationId])

    // Load basic info for the other member
    useEffect(() => {
        if (!conversationId || !userInfo?._id) {
            setContactInfo(null)
            return
        }

        const fetchConversation = async () => {
            try {
                const res = await apiUtils.get(`/conversation/readConversationDetail/${conversationId}`)
                const conv = res.data.metadata.conversation
                const other = conv?.members?.find((m) => m.user && m.user._id !== userInfo._id)?.user
                console.log(other)
                setContactInfo(other || null)
            } catch (error) {
                console.error('Fetch conversation for contact info error:', error)
                setContactInfo(null)
            }
        }

        fetchConversation()
    }, [conversationId, userInfo?._id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!text.trim() || !conversationId || isLoading) return

        const userMessage = text.trim()
        setText('')
        setMessages((prev) => [...prev, { sender: 'user', text: userMessage }])
        setIsLoading(true)

        try {
            // Call AI
            const response = await pythonApiUtils.post('/chat', {
                conversation_id: conversationId, // Changed to match backend
                message: userMessage,
            })

            console.log(response)
            const aiReply = response.data.ai_reply || 'No response from AI.' // Changed to match backend

            // Append AI reply
            const aiMsg = { sender: 'ai', text: aiReply }
            setMessages((prev) => [...prev, aiMsg])
        } catch (error) {
            console.error('AI Error:', error)
            const errText = error.response?.data?.detail || 'Something went wrong.'
            setMessages((prev) => [...prev, { sender: 'ai', text: `Error: ${errText}` }])
        } finally {
            setIsLoading(false)
        }
    }

    const noConversation = !conversationId
    const isProfile = viewMode === 'profile'
    const toggleView = () => setViewMode((prev) => (prev === 'profile' ? 'ai' : 'profile'))

    const calcAge = (dob) => {
        if (!dob) return null
        const date = new Date(dob)
        if (isNaN(date)) return null
        const diff = Date.now() - date.getTime()
        const ageDt = new Date(diff)
        return Math.abs(ageDt.getUTCFullYear() - 1970)
    }

    return (
        <aside className={`ws-assistant ${isProfile ? 'ws-assistant--profile' : ''}`}>
            <button type='button' className='ws-assistant__toggle' onClick={toggleView} aria-label={isProfile ? 'Switch to AI chat' : 'Switch to client info'} title={isProfile ? 'AI chat' : 'Client info'}>
                {isProfile ? <img src={Soulra} alt='Soulra' width={20} height={20} style={{ display: 'block' }} /> : 'i'}
            </button>

            <div className='ws-assistant__header'>
                {isProfile ? (
                    <div className='ws-assistant__title'>Client info</div>
                ) : (
                    <>
                        <img src={Soulra} width={40} height={40} alt='Soulra' />
                        <div className='ws-assistant__title'>Soulra Assistant</div>
                    </>
                )}
            </div>

            <div className='ws-assistant__body'>
                {isProfile ? (
                    <div className='ws-assistant__profile-card'>
                        <img src={contactInfo?.avatar} className='ws-assistant__profile-avatar' />
                        <div className='ws-assistant__profile-name'>{contactInfo?.fullName || 'Unknown'}</div>
                        <div className='ws-assistant__profile-meta'>{contactInfo?.gender?.toUpperCase() || '—'}</div>

                        <div className='ws-assistant__profile-grid'>
                            <div className='ws-assistant__profile-row'>
                                <span className='ws-assistant__profile-label'>Email:</span>
                                <span className='ws-assistant__profile-value'>{contactInfo?.email || '—'}</span>
                            </div>
                            <div className='ws-assistant__profile-row'>
                                <span className='ws-assistant__profile-label'>Phone:</span>
                                <span className='ws-assistant__profile-value'>{contactInfo?.phone || '—'}</span>
                            </div>
                            <div className='ws-assistant__profile-row'>
                                <span className='ws-assistant__profile-label'>Relative:</span>
                                <span className='ws-assistant__profile-value'>{contactInfo?.relationship || '—'}</span>
                            </div>
                            <div className='ws-assistant__profile-row'>
                                <span className='ws-assistant__profile-label'>Age:</span>
                                <span className='ws-assistant__profile-value'>{calcAge(contactInfo?.dob) || '—'}</span>
                            </div>
                            <div className='ws-assistant__profile-row'>
                                <span className='ws-assistant__profile-label'>Address:</span>
                                <span className='ws-assistant__profile-value'>{contactInfo?.address || '—'}</span>
                            </div>
                        </div>
                    </div>
                ) : noConversation ? (
                    <div className='ws-assistant__empty'>
                        <p>Select a patient to view AI chat history.</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className='ws-assistant__empty'>
                        <p>Loading history...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ws-assistant__bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className='ws-assistant__bubble ai'>
                                <p>Thinking...</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {!isProfile && (
                <form className='ws-assistant__input' onSubmit={handleSubmit}>
                    <input placeholder={noConversation ? 'Select a patient first' : 'Ask any request...'} value={text} onChange={(e) => setText(e.target.value)} disabled={isLoading || noConversation} />
                    <button type='submit' disabled={isLoading || !text.trim() || noConversation}>
                        <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#FFFFFF'>
                            <path d='M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z' />
                        </svg>
                    </button>
                </form>
            )}
        </aside>
    )
}
