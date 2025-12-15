// src/pages/workSpace/doctors/Doctors.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './doctors.css'

import doctorAvatar from '../../../assets/doctor-avatar.svg'
import WorkspaceTopBar from '../../../components/Workspace/WorkspaceTopBar'
import DoctorModalForm from './doctorModelForm/doctorModelForm'
import { apiUtils } from '../../../utils/newRequest'

export default function Doctors() {
    const navigate = useNavigate()
    const [openDoctorModal, setOpenDoctorModal] = useState(false)

    const [doctors, setDoctors] = useState(null)

    useEffect(() => {
        const fecthDoctors = async () => {
            try {
                const response = await apiUtils.get('/user/readDoctors')
                setDoctors(response.data.metadata.doctors)
            } catch (error) {
                console.error('Error fetching doctors:', error)
            }
        }
        fecthDoctors()
    }, [])

    const handleCreateDoctor = async (data) => {
        const newDoctor = {
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            specialty: data.specialty || '',
            description: data.description || '',
        }

        try {
            const response = await apiUtils.post('/user/createDoctor', newDoctor)
            console.log('Doctor created successfully:', response.data.metadata.doctor)
            setDoctors((prevDoctors) => [...prevDoctors, response.data.metadata.doctor])
            setOpenDoctorModal(false)
        } catch (error) {
            console.error('Error creating doctor:', error)
        }
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
                    {doctors?.map((doctor) => (
                        <button
                            key={doctor.id}
                            type='button'
                            className='doctors-item'
                            onClick={() =>
                                navigate(`/workspace/doctors/${doctor._id}`, {
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
