import React, { useEffect, useState } from 'react'
import './CreateStaff.css'
import { motion, AnimatePresence } from 'framer-motion'

export default function CreateStaff({ onClose, onSubmit, doctors }) {
    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        specialty: '',
        phoneNumber: '',
        role: 'doctor',
        assistDoctorId: '',
    })

    useEffect(() => {
        if (formData.role !== 'nurse') {
            setFormData((prev) => ({ ...prev, assistDoctorId: '' }))
        }
    }, [formData.role])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: null }))
    }

    const validate = () => {
        const newErrors = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        if (!formData.specialty.trim()) {
            newErrors.specialty = 'Specialty is required'
        }

        if (formData.phoneNumber && !/^[0-9+\-\s]{8,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Invalid phone number'
        }

        if (!['doctor', 'nurse'].includes(formData.role)) {
            newErrors.role = 'Invalid role'
        }

        // 🔥 CONDITIONAL RULE
        if (formData.role === 'nurse' && !formData.assistDoctorId) {
            newErrors.assistDoctorId = 'Assist doctor is required for nurses'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) return

        try {
            await onSubmit({
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                specialty: formData.specialty.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                role: formData.role,
                assistDoctorId: formData.role === 'nurse' ? formData.assistDoctorId : null,
            })
        } catch (err) {
            console.log('🔥 BE ERROR:', err)

            setErrors(
                err?.response?.data?.errors || {
                    _global: err?.response?.data?.message || 'Forbidden',
                }
            )
        }
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
                        {errors.fullName && <p className='form-error'>{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div className='form-group'>
                        <label className='form-label'>Email</label>
                        <div className='input-with-icon'>
                            <input type='email' name='email' className='form-input' placeholder='Enter email' value={formData.email} onChange={handleChange} />
                        </div>
                        {errors.email && <p className='form-error'>{errors.email}</p>}
                    </div>

                    {/* Specialty */}
                    <div className='form-group'>
                        <label className='form-label'>Specialty</label>
                        <div className='input-with-icon'>
                            <input type='text' name='specialty' className='form-input' placeholder='e.g. Cardiology, Dermatology...' value={formData.specialty} onChange={handleChange} />
                        </div>
                        {errors.specialty && <p className='form-error'>{errors.specialty}</p>}
                    </div>

                    {/* Phone */}
                    <div className='form-group'>
                        <label className='form-label'>Phone number</label>
                        <div className='input-with-icon'>
                            <input type='tel' name='phoneNumber' className='form-input' placeholder='Enter phone number' value={formData.phoneNumber} onChange={handleChange} />
                        </div>
                        {errors.phoneNumber && <p className='form-error'>{errors.phoneNumber}</p>}
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Role</label>
                        <select name='role' className='input-with-icon' value={formData.role} onChange={handleChange}>
                            <option value='doctor'>Doctor</option>
                            <option value='nurse'>Nurse</option>
                        </select>
                        {errors.role && <p className='form-error'>{errors.role}</p>}
                    </div>

                    <AnimatePresence>
                        {formData.role === 'nurse' && (
                            <motion.div className='form-group' initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                                <label className='form-label'>Assist doctor</label>
                                <select name='assistDoctorId' className='input-with-icon' value={formData.assistDoctorId} onChange={handleChange}>
                                    <option value=''>Select doctor</option>
                                    {doctors.map((doc) => (
                                        <option key={doc._id} value={doc._id}>
                                            {doc.fullName}
                                        </option>
                                    ))}
                                </select>
                                {errors.assistDoctorId && <p className='form-error'>{errors.assistDoctorId}</p>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {errors._global && <p className='form-error'>{errors._global}</p>}

                    <button type='submit' className='doctor-submit-btn'>
                        Create
                    </button>
                </form>
            </div>
        </div>
    )
}
