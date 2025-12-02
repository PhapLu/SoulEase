import React from 'react'
import './folderModelForm.css'

export default function FolderModalForm({ onClose }) {
    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                <h2>Create Folder</h2>

                <div className='form-group'>
                    <label>Title</label>
                    <input type='text' placeholder='Enter title' />
                </div>

                <div className='form-group'>
                    <label>Description</label>
                    <textarea placeholder='Enter description'></textarea>
                </div>

                <button className='create-btn'>Create</button>
                <button className='close-btn' onClick={onClose}>
                    ✕
                </button>
            </div>
        </div>
    )
}
