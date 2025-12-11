import { Link } from 'react-router-dom'
import '../../../pages/workSpace/conversation/Conversations.css'
import { useEffect, useState } from 'react'
import { apiUtils } from '../../../utils/newRequest'

export default function Conversations() {
    const [conversations, setConversations] = useState([])

    useEffect(() => {
        const fetchConversations = async () => {
            const response = await apiUtils.get('/conversation/readConversations')
            console.log('Fetched conversations:', response.data.metadata.conversations)
            setConversations(response.data.metadata.conversations)
        }
        fetchConversations()
    }, [])

    return (
        <aside className='ws-threads'>
            <h2>Messages</h2>

            <div className='ws-input'>
                <input type='text' placeholder='Search' />
            </div>

            <ul className='ws-thread-list'>
                {conversations.length === 0 ? (
                    <div className='ws-empty-state'>
                        <div className='ws-empty-icon'>💬</div>
                        <p className='ws-empty-text'>You don’t have any conversations yet.</p>
                        <p className='ws-empty-subtext'>Create a client to start messaging them.</p>

                        <Link to='/workspace/patients' className='ws-empty-btn'>
                            + Create Patient
                        </Link>
                    </div>
                ) : (
                    conversations.map((item) => (
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
                    ))
                )}
            </ul>
        </aside>
    )
}
