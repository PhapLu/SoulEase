import React, { useState, useEffect } from 'react'
import './patientModelForm.css'
import { apiUtils } from '../../../../../utils/newRequest'

export default function PatientModalForm({ onClose, onSubmit, initialFolderId = '', lockFolder = false }) {
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        dob: '',
        phoneNumber: '',
        role: 'patient',
        relationship: 'Family',
        folderId: initialFolderId,
    })

    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [doctorFolders, setDoctorFolders] = useState([])

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const res = await apiUtils.get('/folder/readFolders')
                const list = res.data?.metadata?.folders || []

                setDoctorFolders(list)

                // set default folderId if not locked
                setFormData((prev) => {
                    // 🔒 Folder is locked → DO NOT TOUCH folderId
                    if (lockFolder) return prev

                    // 🔓 Folder is selectable → set default if empty
                    return {
                        ...prev,
                        folderId: prev.folderId || list[0]?._id || '',
                    }
                })
            } catch (err) {
                console.log('Failed to load folders', err)
            }
        }

        fetchFolders()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            await onSubmit?.(formData)
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to create patient')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='patient-modal-overlay' onClick={onClose}>
            <div className='patient-modal' onClick={(e) => e.stopPropagation()}>
                <button className='patient-modal-close' onClick={onClose} type='button'>
                    ✕
                </button>

                <h2 className='patient-modal-title'>Create Patient</h2>

                <form className='patient-form' onSubmit={handleSubmit}>
                    {/* Full name */}
                    <div className='form-group'>
                        <label className='form-label'>Full name</label>
                        <div className='input-with-icon'>
                            <input type='text' name='fullName' className='form-input' placeholder='Enter full name' value={formData.fullName} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Email */}
                    <div className='form-group'>
                        <label className='form-label'>Email</label>
                        <div className='input-with-icon'>
                            <input type='email' name='email' className='form-input' placeholder='Enter email' value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Date of birth */}
                    <div className='form-group'>
                        <label className='form-label'>Date of birth</label>
                        <div className='input-with-icon'>
                            <input type='date' name='dob' className='form-input' value={formData.dob} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className='form-group'>
                        <label className='form-label'>Phone number</label>
                        <div className='input-with-icon'>
                            <input type='tel' name='phoneNumber' className='form-input' placeholder='Enter phone number' value={formData.phoneNumber} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Folder */}
                    <div className='form-group'>
                        <label className='form-label'>Folder</label>
                        <div className='input-with-icon'>
                            <select name='folderId' className='form-input' value={formData.folderId} onChange={handleChange} disabled={lockFolder}>
                                {doctorFolders.length === 0 && <option>No folder available</option>}

                                {doctorFolders.map((f) => (
                                    <option key={f._id} value={f._id}>
                                        {f.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && <div className='form-error'>{error}</div>}

                    <button type='submit' className='patient-submit-btn'>
                        Create
                    </button>
                </form>
            </div>
        </div>
    )
}
