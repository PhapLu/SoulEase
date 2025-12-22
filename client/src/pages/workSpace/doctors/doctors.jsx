// src/pages/workSpace/doctors/Doctors.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './doctors.css'

import emptyDoctor from '../../../assets/empty_profile.png'
import doctorAvatar from '../../../assets/doctor-avatar.svg'
import WorkspaceTopBar from '../../../components/Workspace/WorkspaceTopBar'
import DoctorModalForm from './doctorModelForm/doctorModelForm'
import { apiUtils } from '../../../utils/newRequest'

export default function Doctors() {
    const navigate = useNavigate()

    const [openDoctorModal, setOpenDoctorModal] = useState(false)
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchDoctors = async () => {
        setLoading(true)
        try {
            const response = await apiUtils.get('/user/readDoctors')
            const list = response?.data?.metadata?.doctors || []
            setDoctors(Array.isArray(list) ? list : [])
        } catch (error) {
            console.error('Error fetching doctors:', error)
            setDoctors([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDoctors()
    }, [])

    const handleCreateDoctor = async (data) => {
        // Normalize input from modal to match backend fields
        const payload = {
            fullName: data?.fullName || '',
            phone: data?.phone || data?.phoneNumber || '',
            email: data?.email || '',
            speciality: data?.speciality || data?.specialty || '',
            description: data?.description || '',
        }

        try {
            const response = await apiUtils.post('/user/createStaff', newDoctor)
            setDoctors((prevDoctors) => [...prevDoctors, response.data.metadata.doctor])
            setOpenDoctorModal(false)
        } catch (error) {
            console.error('Error creating doctor:', error)
        }
    }

    const getDoctorId = (doctor) => doctor?._id || doctor?.id
    const getDoctorName = (doctor) => doctor?.fullName || doctor?.name || 'Unnamed'
    const getDoctorSpeciality = (doctor) => doctor?.speciality || doctor?.specialty || ''

    return (
        <div className='doctors'>
            <WorkspaceTopBar />

            <section className='doctors-card'>
                <div className='doctors-card-top'>
                    <div className='doctors-tabs'>
                        <p className='doctors-tab'>Clinic Doctors</p>
                    </div>

                    <button className='doctors-btn-ghost' onClick={() => setOpenDoctorModal(true)} type='button'>
                        <span>＋</span>
                        <span>Staff</span>
                    </button>
                </div>

                <div className='doctors-grid'>
                    {doctors && doctors.length === 0 && (
                        <div className='doctors-empty'>
                            <img src={emptyDoctor} alt='Empty doctor profile' className='doctors-empty-avatar' />
                            <h3 className='doctors-empty-title'>No doctor profile yet</h3>
                            <p className='doctors-empty-text'>Doctor profiles will appear here once they are created or invited.</p>

                            <button className='doctors-btn-primary' onClick={() => setOpenDoctorModal(true)}>
                                + Add your first doctor
                            </button>
                        </div>
                    )}

                    {doctors?.map((doctor) => (
                        <button
                            key={doctor._id}
                            type='button'
                            className='doctors-item'
                            onClick={() =>
                                navigate(`/workspace/doctors/${doctor._id}`, {
                                    state: { doctor },
                                })
                            }
                        >
                            <img src={doctorAvatar} alt={doctor.fullName} className='doctors-avatar' />
                            <span className='doctors-name'>{doctor.fullName}</span>
                            {doctor.specialty && <span className='doctors-specialty'>{doctor.specialty}</span>}
                        </button>
                    ))}
                </div>
            </section>

            {openDoctorModal && <DoctorModalForm onClose={() => setOpenDoctorModal(false)} onSubmit={handleCreateDoctor} />}
        </div>
    )
}
