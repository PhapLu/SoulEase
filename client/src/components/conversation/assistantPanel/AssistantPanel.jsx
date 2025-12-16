// src/components/conversation/assistantPanel/AssistantPanel.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Soulra from '../../../assets/icons/Soulra.svg';
import { pythonApiUtils } from '../../../utils/pythonRequest';
import '../../../pages/workSpace/conversation/Conversations.css';

export default function AssistantPanel() {
    const { conversationId } = useParams();  // This is the patient/conversation ID
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load AI history when patient changes
    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            return;
        }

        const loadHistory = async () => {
            setIsLoading(true);
            try {
                const res = await pythonApiUtils.get(`/ai-history/${conversationId}`);
                const loaded = res.data.messages || [];
                const formatted = loaded.map(m => ({
                    sender: m.sender,
                    text: m.text
                }));
                setMessages(formatted.length > 0 ? formatted : [{ sender: 'ai', text: 'Hello! How may I help?' }]);
            } catch (err) {
                console.error("Load AI history error:", err);
                setMessages([{ sender: 'ai', text: 'Hello! How may I help?' }]);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [conversationId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !conversationId || isLoading) return;

        const userMessage = text.trim();
        setText('');
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // Call AI
            const response = await pythonApiUtils.post('/chat', {
                conversation_id: conversationId,  // Changed to match backend
                message: userMessage
            });

            const aiReply = response.data.ai_reply || "No response from AI.";  // Changed to match backend

            // Append AI reply
            const aiMsg = { sender: 'ai', text: aiReply };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Error:", error);
            const errText = error.response?.data?.detail || "Something went wrong.";
            setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${errText}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const noConversation = !conversationId;

    return (
        <aside className='ws-assistant'>
            <div className='ws-assistant__header'>
                <img src={Soulra} width={40} height={40} alt='Soulra' />
                <div className='ws-assistant__title'>Soulra Assistant</div>
            </div>

            <div className='ws-assistant__body'>
                {noConversation ? (
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
                            <div
                                key={idx}
                                className={`ws-assistant__bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}
                            >
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

            <form className='ws-assistant__input' onSubmit={handleSubmit}>
                <input
                    placeholder={noConversation ? 'Select a patient first' : 'Ask any request...'}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isLoading || noConversation}
                />
                <button type="submit" disabled={isLoading || !text.trim() || noConversation}>
                    Send
                </button>
            </form>
        </aside>
    );
}