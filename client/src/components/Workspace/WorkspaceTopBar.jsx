import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './WorkspaceTopBar.css'
import PatientModalForm from '../../pages/workSpace/patients/folderClients/patientModelForm/patientModelForm'
import { useAuth } from '../../contexts/auth/AuthContext'
import { apiUtils } from '../../utils/newRequest'

export default function WorkspaceTopBar() {
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const { folderId } = useParams()
    const { userInfo } = useAuth()
    const [showModal, setShowModal] = useState(false)
    const isInsideFolder = !!folderId

    const handleCreateClient = async (data) => {
        try {
            const payload = {
                fullName: data.fullName,
                email: data.email,
                dob: data.dob,
                phoneNumber: data.phoneNumber,
                role: data.role,
                relationship: data.relationship,
                folderId: data.folderId,
            }

            await apiUtils.post('/patientRecord/createPatientRecord', payload)

            setOpenCreateModal(false)
        } catch (err) {
            console.log(err)
            alert('Failed to create client.')
        }
    }

    return (
        <header className='workspace-topbar'>
            <div className='workspace-topbar-search-wrapper'>
                <input className='workspace-topbar-search-input' placeholder='Search for ....' />
            </div>

            <div className='workspace-topbar-actions'>
                <button className='workspace-topbar-btn' onClick={() => setOpenCreateModal(true)}>
                    <span>
                        <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#0c1317'>
                            <path d='M444-144v-300H144v-72h300v-300h72v300h300v72H516v300h-72Z' />
                        </svg>
                    </span>
                    <span>Create Client</span>
                </button>

                <button className='workspace-topbar-btn workspace-topbar-btn-primary'>Upgrade plus</button>

                <div className='user-dropdown-wrapper'>
                    <div className='workspace-topbar-user-pill'>
                        <div className='workspace-topbar-user-avatar' />
                        <span>{`Dr. ${userInfo?.fullName}`}</span>
                    </div>

                    <div className='user-dropdown-menu'>
                        <h4 className='user-dropdown-title'>{`Hi, Dr ${userInfo?.fullName}`}</h4>
                        <p className='user-dropdown-email'>{`${userInfo?.email}`}</p>

                        <hr className='user-dropdown-divider' />

                        <button className='dropdown-item'>
                            <svg xmlns='http://www.w3.org/2000/svg' height='25px' viewBox='0 -960 960 960' width='25px' fill='#0c1317'>
                                <path d='M237-285q54-38 115.5-56.5T480-360q66 0 127.5 18.5T723-285q35-41 52-91t17-104q0-129.67-91.23-220.84-91.23-91.16-221-91.16Q350-792 259-700.84 168-609.67 168-480q0 54 17 104t52 91Zm243-123q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42Zm.28 312Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q52 0 100-16.5t90-48.5q-43-27-91-41t-99-14q-51 0-99.5 13.5T290-233q42 32 90 48.5T480-168Zm0-312q30 0 51-21t21-51q0-30-21-51t-51-21q-30 0-51 21t-21 51q0 30 21 51t51 21Zm0-72Zm0 319Z' />
                            </svg>
                            <span>Account</span>
                        </button>

                        <Link to='/workspace/patients' className='dropdown-item'>
                            <svg xmlns='http://www.w3.org/2000/svg' height='25px' viewBox='0 -960 960 960' width='25px' fill='#0c1317'>
                                <path d='M96-192v-92q0-25.78 12.5-47.39T143-366q54-32 114.5-49T384-432q66 0 126.5 17T625-366q22 13 34.5 34.61T672-284v92H96Zm648 0v-92q0-42-19.5-78T672-421q39 8 75.5 21.5T817-366q22 13 34.5 34.67Q864-309.65 864-284v92H744ZM384-480q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42Zm336-144q0 60-42 102t-102 42q-8 0-15-.5t-15-2.5q25-29 39.5-64.5T600-624q0-41-14.5-76.5T546-765q8-2 15-2.5t15-.5q60 0 102 42t42 102ZM168-264h432v-20q0-6.47-3.03-11.76-3.02-5.3-7.97-8.24-47-27-99-41.5T384-360q-54 0-106 14t-99 42q-4.95 2.83-7.98 7.91-3.02 5.09-3.02 12V-264Zm216.21-288Q414-552 435-573.21t21-51Q456-654 434.79-675t-51-21Q354-696 333-674.79t-21 51Q312-594 333.21-573t51 21ZM384-264Zm0-360Z' />
                            </svg>
                            <p>Clients</p>
                        </Link>

                        <button className='dropdown-item dropdown-item-logout'>
                            <svg xmlns='http://www.w3.org/2000/svg' height='25px' viewBox='0 -960 960 960' width='25px' fill='#0c1317'>
                                <path d='M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z' />
                            </svg>
                            <span>Log out</span>
                        </button>

                        <hr className='user-dropdown-divider' />
                        <small className='user-dropdown-footer'>© 2025 SoulEase</small>
                    </div>
                </div>
            </div>
            {openCreateModal && <PatientModalForm onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateClient} lockFolder={false} />}
        </header>
    )
}
