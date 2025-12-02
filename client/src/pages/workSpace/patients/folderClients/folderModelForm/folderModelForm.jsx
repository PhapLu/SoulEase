import React, { useState } from 'react'
import './folderModelForm.css'

export default function FolderModalForm({ onClose, onSubmit }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!title.trim()) return

        onSubmit({
            name: title.trim(),
            description: description.trim(),
        })
    }

    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <button className='close-btn' onClick={onClose}>
                    ✕
                </button>

                <h2>Create Folder</h2>

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>Title</label>
                        <input type='text' placeholder='Enter title' className='text-input' value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className='form-group'>
                        <label>Description</label>
                        <textarea placeholder='Enter description' className='text-input' value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <button type='submit' className='create-btn'>
                        Create
                    </button>
                </form>
            </div>
        </div>
    )
}
