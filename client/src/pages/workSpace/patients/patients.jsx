import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './patients.css'
import folderIcon from '../../../assets/folder.svg'
import WorkspaceTopBar from '../../../components/Workspace/WorkspaceTopBar'
import FolderModalForm from './folderClients/folderModelForm/folderModelForm'
import { apiUtils } from '../../../utils/newRequest'
import emptyDoctor from '../../../assets/empty_profile.png'
import { useAuth } from '../../../contexts/auth/AuthContext'

export default function Patients() {
    const navigate = useNavigate()
    const { userInfo } = useAuth()
    const [openFolderModal, setOpenFolderModal] = useState(false)
    const [folders, setFolders] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchFolders = async () => {
        try {
            setIsLoading(true)
            const res = await apiUtils.get('/folder/readFolders')
            setFolders(res.data.metadata.folders || [])
        } catch (err) {
            console.log('Failed to load folders:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (userInfo?.role !== 'family') return
        const redirectToRelativeRecord = async () => {
            try {
                const res = await apiUtils.get('/relative/readMyPatientRecord')
                const patientRecord = res?.data?.metadata?.patientRecord || res?.data?.patientRecord || null
                const folderId = patientRecord?.folderId
                const patientId = patientRecord?.patientId
                if (folderId && patientId) {
                    navigate(`/workspace/patients/folder/${folderId}/${patientId}`, { replace: true })
                    return
                }
                if (patientId) {
                    navigate(`/workspace/patients/${patientId}/profiles`, { replace: true })
                    return
                }
            } catch (err) {
                console.error('Failed to load relative patient record', err)
            }
            navigate('/workspace/notifications', { replace: true })
        }
        redirectToRelativeRecord()
    }, [userInfo, navigate])

    useEffect(() => {
        if (userInfo?.role === 'family') return
        fetchFolders()
    }, [userInfo])

    const handleCreateFolder = async (data) => {
        try {
            await apiUtils.post('/folder/createFolder', {
                title: data.title,
                description: data.description,
            })

            await fetchFolders()
            setOpenFolderModal(false)
        } catch (err) {
            console.log('Create folder failed:', err)
        }
    }

    const sortedFolders = useMemo(() => {
        return [...folders].sort((a, b) => {
            // Archived goes last
            if (a.isArchived && !b.isArchived) return 1
            if (!a.isArchived && b.isArchived) return -1

            // Sort by createdAt newest first
            return new Date(b.createdAt) - new Date(a.createdAt)
        })
    }, [folders])

    return (
        <div className='patients'>
            <WorkspaceTopBar />

            <section className='patients-card'>
                <div className='patients-card-top'>
                    <div className='patients-tabs'>
                        <p className='patients-tab'>Documents Groups Patients</p>
                    </div>

                    <button className='patients-btn-ghost' onClick={() => setOpenFolderModal(true)}>
                        <span>＋</span>
                        <span>Folder</span>
                    </button>
                </div>

                {!isLoading && folders.length === 0 && (
                    <div className='doctors-empty'>
                        <img src={emptyDoctor} alt='Empty patients' className='doctors-empty-avatar' />
                        <h3 className='doctors-empty-title'>No folders yet</h3>
                        <p className='doctors-empty-text'>Patient folders will appear here once you start organizing your records.</p>

                        <button className='doctors-btn-primary' onClick={() => setOpenFolderModal(true)}>
                            + Create your first folder
                        </button>
                    </div>
                )}

                <div className='patients-folders-grid'>
                    {sortedFolders.map((folder) => (
                        <div
                            key={folder._id}
                            className='patients-folder-item'
                            onClick={() =>
                                navigate(`/workspace/patients/folder/${folder._id}`, {
                                    state: { folder },
                                })
                            }
                        >
                            <img src={folderIcon} alt={folder.title} />
                            <span>{folder.title}</span>
                        </div>
                    ))}
                </div>
            </section>

            {openFolderModal && <FolderModalForm onClose={() => setOpenFolderModal(false)} onSubmit={handleCreateFolder} />}
        </div>
    )
}
