import { useState } from 'react'
import './WorkspaceTopBar.css'
import PatientModalForm from '../../pages/workSpace/patients/folderClients/patientModelForm/patientModelForm'

export default function WorkspaceTopBar() {
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const { folderId } = useParams()
    const [showModal, setShowModal] = useState(false)

    const isInsideFolder = !!folderId
    const handleCreateClient = (data) => {
        const parts = data.fullName.trim().split(' ')
        const lastName = parts.length > 1 ? parts[parts.length - 1] : ''
        const firstName = parts.length > 1 ? parts.slice(0, parts.length - 1).join(' ') : parts[0]

        const birthYear = data.dob ? new Date(data.dob).getFullYear() : null
        const currentYear = new Date().getFullYear()
        const age = birthYear ? currentYear - birthYear : 0

        const newClient = {
            id: `client-${Date.now()}`,
            firstName,
            lastName,
            age,
            phone: data.phoneNumber,
            email: data.email,
            relationship: data.relationship,
        }

        setClients((prev) => [...prev, newClient])
        setOpenCreateModal(false)
    }
    return (
        <header className='workspace-topbar'>
            <div className='workspace-topbar-search-wrapper'>
                <input className='workspace-topbar-search-input' placeholder='Search for ....' />
            </div>

            <div className='workspace-topbar-actions'>
                <button className='workspace-topbar-btn' onClick={() => setShowModal(true)}>
                    <span>＋</span>
                    <span>Create Client</span>
                </button>

                {/* MODAL */}
                {showModal && <PatientModalForm onClose={() => setShowModal(false)} onSubmit={handleCreateClient} folders={folders} initialFolderId={folderId || ''} lockFolder={isInsideFolder} />}

                <button className='workspace-topbar-btn workspace-topbar-btn-primary'>Upgrade plus</button>

                <div className='workspace-topbar-user-pill'>
                    <div className='workspace-topbar-user-avatar' />
                    <span>Dr. John Smith</span>
                </div>
            </div>
            {openCreateModal && <PatientModalForm onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateClient} />}
        </header>
    )
}
