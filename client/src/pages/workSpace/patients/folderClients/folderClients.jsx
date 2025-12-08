import { useState, useMemo, useEffect } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import './folderClients.css'
import folderIcon from '../../../../assets/folder.svg'
import PatientModalForm from '../folderClients/patientModelForm/patientModelForm'
import WorkspaceTopBar from '../../../../components/Workspace/WorkspaceTopBar'
import { apiUtils } from '../../../../utils/newRequest'

export default function FolderClients() {
    const navigate = useNavigate()
    const { folderId } = useParams()
    const location = useLocation()
    const [showModal, setShowModal] = useState(false)
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('lastName')

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [folderInfo, setFolderInfo] = useState({
        title: '',
        description: '',
    })

    useEffect(() => {
        const fetchFolder = async () => {
            try {
                setIsLoading(true)
                setError('')

                const res = await apiUtils.get(`/folder/readFolder/${folderId}`)
                const folder = res.data.metadata.folder
                setFolderInfo(folder)
            } catch (err) {
                console.log('Failed to load folder:', err)
                setError('Failed to load folder.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchFolder()
    }, [folderId])

    const filteredClients = useMemo(() => {
        const records = folderInfo?.records || []

        let data = records.filter((client) => client?.fullName?.toLowerCase().includes(search.toLowerCase()))

        if (sortBy === 'lastName') {
            data.sort((a, b) => {
                const lastA = a?.fullName?.split(' ').slice(-1)[0]
                const lastB = b?.fullName?.split(' ').slice(-1)[0]
                return lastA.localeCompare(lastB)
            })
        } else if (sortBy === 'firstName') {
            data.sort((a, b) => {
                const firstA = a?.fullName?.split(' ')[0]
                const firstB = b?.fullName?.split(' ')[0]
                return firstA.localeCompare(firstB)
            })
        } else if (sortBy === 'age') {
            data.sort((a, b) => calcAge(a?.dob) - calcAge(b?.dob))
        }

        return data
    }, [folderInfo.records, search, sortBy])

    const handleCreateClient = async (data) => {
        try {
            const payload = {
                fullName: data.fullName,
                email: data.email,
                dob: data.dob,
                phoneNumber: data.phoneNumber,
                role: data.role,
                relationship: data.relationship,
                folderId,
            }

            const res = await apiUtils.post('/patientRecord/createPatientRecord', payload)

            const createdClient = res.data.metadata.user

            setFolderInfo((prev) => ({
                ...prev,
                records: [...(prev.records || []), createdClient],
            }))

            setOpenCreateModal(false)
        } catch (err) {
            console.log(err)
            alert('Failed to create client. Please try again.')
        }
    }

    const handleStartEdit = () => {
        setEditTitle(folderInfo.title)
        setEditDescription(folderInfo.description)
        setIsEditing(true)
    }

    const calcAge = (dob) => (dob ? new Date().getFullYear() - new Date(dob).getFullYear() : '')

    const handleDeleteEdit = async () => {
        const confirmed = window.confirm('Are you sure you want to delete this folder? All the patient records will go to archived folder.')
        if (!confirmed) return

        try {
            setIsSaving(true)
            await apiUtils.delete(`/folder/deleteFolder/${folderId}`)

            console.log('Folder deleted successfully')
            navigate('/workspace/patients')
        } catch (err) {
            console.log('Failed to delete folder:', err)
            alert('Failed to delete folder. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveEdit = async () => {
        const payload = {
            title: editTitle.trim() || 'Untitled Folder',
            description: editDescription.trim(),
        }

        try {
            setIsSaving(true)
            const res = await apiUtils.patch(`/folder/updateFolder/${folderId}`, payload)
            const updatedFolder = res.data.metadata.folder || payload
            setFolderInfo(updatedFolder)
            setIsEditing(false)
        } catch (err) {
            console.log('Failed to load folders:', err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelEdit = () => {
        setEditTitle(folderInfo.title)
        setEditDescription(folderInfo.description)
        setIsEditing(false)
    }

    if (isLoading) {
        return (
            <section className='folder-page loading'>
                <WorkspaceTopBar />
                <div className='folder-loading-container'>
                    <div className='folder-spinner'></div>
                    <p>Loading folder...</p>
                </div>
            </section>
        )
    }

    return (
        <>
            <section className='folder-page'>
                <WorkspaceTopBar />
                <div className='folder-card'>
                    {/* HEADER */}
                    <div className='folder-card-header'>
                        <div className='folder-info-main'>
                            <img src={folderIcon} className='folder-info-icon' alt='' />

                            {isEditing ? (
                                <div className='folder-edit-fields'>
                                    <input type='text' className='folder-edit-input' value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder='Folder name' />

                                    <textarea className='folder-edit-textarea' value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder='Folder description...' />
                                </div>
                            ) : (
                                <div>
                                    <h1 className='folder-info-title'>{folderInfo.title ? <p>{folderInfo.title}</p> : <p className='folder-empty-fill'>No Folder Name</p>}</h1>
                                    <p className='folder-info-subtitle'>Total Clients: {filteredClients.length}</p>
                                </div>
                            )}
                        </div>

                        {!isEditing && <div className='folder-description'>{folderInfo.description ? <p>{folderInfo.description}</p> : <p className='folder-empty-fill'>No description</p>}</div>}

                        <div className='folder-header-actions-row'>
                            {isEditing ? (
                                <>
                                    <button className='folder-save-btn' onClick={handleSaveEdit}>
                                        Save
                                    </button>
                                    <button className='folder-cancel-btn' onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                !folderInfo.isArchived && (
                                    <button className='folder-edit-btn' onClick={handleStartEdit}>
                                        <span>
                                            <svg xmlns='http://www.w3.org/2000/svg' height='16px' viewBox='0 -960 960 960' width='16px' fill='#0c1317'>
                                                <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
                                            </svg>
                                        </span>
                                        <span>Edit</span>
                                    </button>
                                )
                            )}

                            {!folderInfo.isArchived && (
                                <>
                                    <button className='folder-add-btn' onClick={() => setOpenCreateModal(true)}>
                                        <span>
                                            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#0c1317'>
                                                <path d='M444-144v-300H144v-72h300v-300h72v300h300v72H516v300h-72Z' />
                                            </svg>
                                        </span>
                                        <span>Add Client</span>
                                    </button>

                                    <button className='folder-btn-delete' onClick={handleDeleteEdit}>
                                        <span>
                                            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#ef4444'>
                                                <path d='M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z' />
                                            </svg>
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* SEARCH + SORT */}
                    <div className='folder-controls'>
                        <div className='folder-search-wrapper'>
                            <input type='search' placeholder='Search client ...' value={search} onChange={(e) => setSearch(e.target.value)} className='folder-search-input' />
                        </div>

                        <div className='folder-sort-wrapper'>
                            <label className='folder-sort-label'>Sort:</label>
                            <select className='folder-sort-select' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value='lastName'>Last name</option>
                                <option value='firstName'>First name</option>
                                <option value='age'>Age</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className='folder-table-wrapper'>
                        <table className='folder-table'>
                            <thead>
                                <tr>
                                    <th className='folder-col-number'>No.</th>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Contact info</th>
                                    <th>Relationship</th>
                                    <th className='folder-col-actions'></th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredClients.map((client, index) => (
                                    <tr key={client._id}>
                                        <td>{index + 1}.</td>
                                        <td>
                                            <Link to={`/workspace/patients/folder/${folderId}/${client._id}`} className='folder-name-link'>
                                                {client.fullName}
                                            </Link>
                                        </td>
                                        <td>{calcAge(client.dob)}</td>
                                        <td className='folder-contact-cell'>
                                            <div>{client.phone}</div>
                                            <div>{client.email}</div>
                                        </td>
                                        <td>{client.relationship}</td>
                                        {/* <td>
                                            {!folderInfo.isArchived && (
                                                <button className='folder-delete-btn'>
                                                    <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#ef4444'>
                                                        <path d='M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z' />
                                                    </svg>
                                                </button>
                                            )}
                                        </td> */}
                                    </tr>
                                ))}

                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className='folder-empty'>
                                            No clients found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL */}
                {openCreateModal && <PatientModalForm onClose={() => setOpenCreateModal(false)} onSubmit={handleCreateClient} disabled={folderInfo.isArchived} />}
            </section>
        </>
    )
}
