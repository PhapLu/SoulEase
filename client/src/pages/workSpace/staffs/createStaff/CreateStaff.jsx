import React, { useState } from 'react'
import './CreateStaff.css'
import { motion, AnimatePresence } from 'framer-motion'

export default function DoctorModalForm({ onClose, onSubmit, doctors }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        specialty: '',
        phoneNumber: '',
        role: 'doctor',
        assistDoctorId: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        onSubmit?.({
            fullName: formData.fullName,
            email: formData.email,
            specialty: formData.specialty,
            phoneNumber: formData.phoneNumber,
            role: formData.role,
            assistDoctorId: formData.role === 'nurse' ? formData.assistDoctorId : null,
        })
    }

    return (
        <div className='doctor-modal-overlay'>
            <div className='doctor-modal'>
                <button className='doctor-modal-close' onClick={onClose}>
                    ✕
                </button>

                <h2 className='doctor-modal-title'>Create staff</h2>

                <form className='doctor-form' onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className='form-group'>
                        <label className='form-label'>Full name</label>
                        <div className='input-with-icon'>
                            <input type='text' name='fullName' className='form-input' placeholder="Enter staff's full name" value={formData.fullName} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Email */}
                    <div className='form-group'>
                        <label className='form-label'>Email</label>
                        <div className='input-with-icon'>
                            <input type='email' name='email' className='form-input' placeholder='Enter email' value={formData.email} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Specialty */}
                    <div className='form-group'>
                        <label className='form-label'>Specialty</label>
                        <div className='input-with-icon'>
                            <input type='text' name='specialty' className='form-input' placeholder='e.g. Cardiology, Dermatology...' value={formData.specialty} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className='form-group'>
                        <label className='form-label'>Phone number</label>
                        <div className='input-with-icon'>
                            <input type='tel' name='phoneNumber' className='form-input' placeholder='Enter phone number' value={formData.phoneNumber} onChange={handleChange} />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Role</label>
                        <select name='role' className='input-with-icon' value={formData.role} onChange={handleChange}>
                            <option value='doctor'>Doctor</option>
                            <option value='nurse'>Nurse</option>
                        </select>
                    </div>

                    <AnimatePresence>
                        {formData.role === 'nurse' && (
                            <motion.div className='form-group' initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                <label className='form-label'>Assist doctor</label>
                                <select name='assistDoctorId' className='input-with-icon' value={formData.assistDoctorId} onChange={handleChange} required>
                                    <option value=''>Select doctor</option>
                                    {doctors.map((doc) => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.fullName}
                                        </option>
                                    ))}
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button type='submit' className='doctor-submit-btn'>
                        Create
                    </button>
                </form>
            </div>
        </div>
    )
}
