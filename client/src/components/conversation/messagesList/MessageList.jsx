import { Link } from 'react-router-dom'
import '../../../pages/workSpace/conversation/Conversations.css'

const conversations = [
    { id: 1, name: "Patient's name", snippet: 'Hello, I am Lora...', time: '1 hour ago', unread: true },
    { id: 2, name: "Patient's name", snippet: 'Hello, I am Lora...' },
    { id: 3, name: "Patient's name", snippet: 'Hello, I am Lora...' },
]

export default function MessagesList() {
    return (
        <aside className='ws-threads'>
            <h2>Messages</h2>

            <div className='ws-input'>
                <input type='text' placeholder='Search' />
            </div>

            <ul className='ws-thread-list'>
                {conversations.map((item) => (
                    <li key={item.id} className='ws-thread'>
                        <Link to={`/workspace/messages/${item.id}`} className='ws-thread-link'>
                            <div className='ws-thread__avatar' />
                            <div className='ws-thread__meta'>
                                <span className='ws-thread__name'>{item.name}</span>
                                <span className='ws-thread__snippet'>{item.snippet}</span>
                            </div>
                            <div className='ws-thread__time'>
                                {item.time && <span>{item.time}</span>}
                                {item.unread && <span className='ws-dot' />}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    )
}
