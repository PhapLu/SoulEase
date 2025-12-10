import { useParams } from 'react-router-dom'
import '../../../pages/workSpace/conversation/Conversations.css'

const demoMessages = [
    { id: 1, sender: 'patient', text: 'Hello, I am Lora' },
    { id: 2, sender: 'me', text: 'Hi Lora, How can I help you?' },
]

export default function ConversationDetail() {
    const { conversationId } = useParams()

    return (
        <section className='ws-chat'>
            <header className='ws-chat__header'>
                <div className='ws-chat__avatar' />
                <div>
                    <div className='ws-chat__name'>Patient {conversationId}</div>
                    <div className='ws-chat__status'>Active now</div>
                </div>
            </header>

            <div className='ws-chat__body'>
                {demoMessages.map((msg) => (
                    <div key={msg.id} className={`ws-bubble ${msg.sender === 'me' ? 'ws-bubble--me' : ''}`}>
                        {msg.sender === 'patient' && <div className='ws-avatar-circle' />}
                        <p>{msg.text}</p>
                    </div>
                ))}
            </div>

            <form className='ws-chat__input' onSubmit={(e) => e.preventDefault()}>
                <input type='text' placeholder='Type your message...' />
                <button>Send</button>
            </form>
        </section>
    )
}
