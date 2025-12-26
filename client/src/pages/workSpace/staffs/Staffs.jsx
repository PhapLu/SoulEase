// src/pages/workSpace/doctors/Doctors.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Staffs.css'

import emptyDoctor from '../../../assets/empty_profile.png'
import doctorAvatar from '../../../assets/doctor-avatar.svg'
import WorkspaceTopBar from '../../../components/Workspace/WorkspaceTopBar'
import CreateStaff from './createStaff/CreateStaff'
import { apiUtils } from '../../../utils/newRequest'

export default function Staffs() {
    const navigate = useNavigate()

    const [openCreateStaffModal, setOpenCreateStaffModal] = useState(false)
    const [staffs, setStaffs] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchStaffs = async () => {
        setLoading(true)
        try {
            const response = await apiUtils.get('/user/readStaffs')
            const list = response?.data?.metadata?.staffs || []

            setStaffs(list)
        } catch (error) {
            console.error('Error fetching staffs:', error)
            setStaffs([])
        } finally {
            setLoading(false)
        }
    }

    const doctors = staffs.filter((u) => u.role === 'doctor')

    useEffect(() => {
        fetchStaffs()
    }, [])

    const handleCreateDoctor = async (data) => {
        // Normalize input from modal to match backend fields
        const payload = {
            fullName: data?.fullName || '',
            phone: data?.phone || data?.phoneNumber || '',
            email: data?.email || '',
            speciality: data?.speciality || data?.specialty || '',
            description: data?.description || '',
            role: data?.role,
            assistDoctorId: data?.assistDoctorId || null,
        }

        try {
            const response = await apiUtils.post('/user/createStaff', payload)
            setStaffs((prev) => [...prev, response.data.metadata.staff])
            setOpenCreateStaffModal(false)
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
                        <p className='doctors-tab'>Clinic Staffs</p>
                    </div>

                    <button className='doctors-btn-ghost' onClick={() => setOpenCreateStaffModal(true)} type='button'>
                        <span>＋</span>
                        <span>Staff</span>
                    </button>
                </div>
                {staffs && staffs.length === 0 && (
                    <div className='doctors-empty'>
                        <img src={emptyDoctor} alt='Empty doctor profile' className='doctors-empty-avatar' />
                        <h3 className='doctors-empty-title'>No staff profile yet</h3>
                        <p className='doctors-empty-text'>Staff profiles will appear here once they are created.</p>

                        <button className='doctors-btn-primary' onClick={() => setOpenCreateStaffModal(true)}>
                            + Add your first staff
                        </button>
                    </div>
                )}
                <div className='doctors-grid'>
                    {staffs?.map((staff) => (
                        <button
                            key={staff?._id}
                            type='button'
                            className='doctors-item'
                            onClick={() =>
                                navigate(`/workspace/staffs/${staff?._id}`, {
                                    state: { staff },
                                })
                            }
                        >
                            <img src={doctorAvatar} alt={staff?.fullName} className='doctors-avatar' />
                            <span className='doctors-name'>{staff?.fullName}</span>
                            {staff?.specialty && <span className='doctors-specialty'>{staff?.specialty}</span>}
                        </button>
                    ))}
                </div>
            </section>

            {openCreateStaffModal && <CreateStaff onClose={() => setOpenCreateStaffModal(false)} onSubmit={handleCreateDoctor} doctors={doctors} />}
        </div>
    )
}
