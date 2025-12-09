// src/pages/workSpace/doctors/Doctors.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './doctors.css'

import doctorAvatar from '../../../assets/doctor-avatar.svg'
import WorkspaceTopBar from '../../../components/Workspace/WorkspaceTopBar'
import DoctorModalForm from './doctorModelForm/doctorModelForm'

export default function Doctors() {
    const navigate = useNavigate()
    const [openDoctorModal, setOpenDoctorModal] = useState(false)

    const [doctors, setDoctors] = useState([
        {
            id: 'doctor-1',
            name: 'Dr. John Doe',
            specialty: 'Cardiology',
            description: 'Chuyên tim mạch',
        },
        {
            id: 'doctor-2',
            name: 'Dr. Jane Smith',
            specialty: 'Dermatology',
            description: 'Chuyên da liễu',
        },
        {
            id: 'doctor-3',
            name: 'Dr. Alex Nguyen',
            specialty: 'Pediatrics',
            description: 'Chuyên nhi',
        },
    ])

    const handleCreateDoctor = (data) => {
        const newDoctor = {
            id: `doctor-${Date.now()}`,
            name: data.name,
            specialty: data.specialty || '',
            description: data.description || '',
        }

        setDoctors((prev) => [...prev, newDoctor])
        setOpenDoctorModal(false)
    }

    return (
        <div className='doctors'>
            <WorkspaceTopBar />

            <section className='doctors-card'>
                <div className='doctors-card-top'>
                    <div className='doctors-tabs'>
                        <p className='doctors-tab'>Clinic Doctors</p>
                    </div>

                    <button className='doctors-btn-ghost' onClick={() => setOpenDoctorModal(true)}>
                        <span>＋</span>
                        <span>Doctor</span>
                    </button>
                </div>

                <div className='doctors-grid'>
                    {doctors.map((doctor) => (
                        <button
                            key={doctor.id}
                            type='button'
                            className='doctors-item'
                            onClick={() =>
                                navigate(`/workspace/doctors/${doctor.id}`, {
                                    state: { doctor },
                                })
                            }
                        >
                            <img src={doctorAvatar} alt={doctor.name} className='doctors-avatar' />
                            <span className='doctors-name'>{doctor.name}</span>
                            {doctor.specialty && <span className='doctors-specialty'>{doctor.specialty}</span>}
                        </button>
                    ))}
                </div>
            </section>

            {openDoctorModal && <DoctorModalForm onClose={() => setOpenDoctorModal(false)} onSubmit={handleCreateDoctor} />}
        </div>
    )
}
