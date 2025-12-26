import { Link } from 'react-router-dom'
import '../../../pages/workSpace/conversation/Conversations.css'
import { useEffect, useState } from 'react'
import { apiUtils } from '../../../utils/newRequest'
import { useAuth } from '../../../contexts/auth/AuthContext'

export default function Conversations() {
    const [conversations, setConversations] = useState([])
    const { userInfo } = useAuth()
    const role = userInfo?.role
    const isClinic = role === 'clinic'
    const emptyCTA = {
        text: isClinic ? '+ Create Staff' : '+ Create Patient',
        link: isClinic ? '/workspace/staffs' : '/workspace/patients',
        subtext: isClinic ? 'Create your first staff member to start internal communication.' : 'Create a patient to start messaging them.',
    }

    useEffect(() => {
        const fetchConversations = async () => {
            const response = await apiUtils.get('/conversation/readConversations')
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
                        <p className='ws-empty-subtext'>{emptyCTA.subtext}</p>

                        <Link to={emptyCTA.link} className='ws-empty-btn'>
                            {emptyCTA.text}
                        </Link>
                    </div>
                ) : (
                    conversations.map((item) => (
                        <li key={item.id} className='ws-thread'>
                            <Link to={`/workspace/messages/${item.id}`} className='ws-thread-link'>
                                <img src={item?.thumbnail} className='ws-thread__avatar' />
                                <div className='ws-thread__meta'>
                                    <span className='ws-thread__name'>{item.displayName}</span>
                                    <span className='ws-thread__snippet'>{item.lastMessage}</span>
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
