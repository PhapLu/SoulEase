import { useState } from 'react'
import Soulra from '../../../assets/icons/Soulra.svg'
import '../../../pages/workSpace/conversation/Conversations.css'

export default function AssistantPanel() {
    const [text, setText] = useState('')

    return (
        <aside className='ws-assistant'>
            <div className='ws-assistant__header'>
                <img src={Soulra} width={40} height={40} alt='' />
                <div className='ws-assistant__title'>Soulra Assistant</div>
            </div>

            <div className='ws-assistant__body'>
                <div className='ws-assistant__bubble'>
                    <p>Hello! How may I help?</p>
                </div>
            </div>

            <form className='ws-assistant__input' onSubmit={(e) => e.preventDefault()}>
                <input placeholder='Ask any request...' value={text} onChange={(e) => setText(e.target.value)} />
                <button>Send</button>
            </form>
        </aside>
    )
}
