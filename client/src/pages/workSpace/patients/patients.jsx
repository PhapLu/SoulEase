import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './patients.css'
import folderIcon from '../../../assets/folder.svg'
import WorkspaceTopBar from '../../../components/Workspace/WorkspaceTopBar'
import FolderModalForm from './folderClients/folderModelForm/folderModelForm'
import { apiUtils } from '../../../utils/newRequest'

export default function Patients() {
    const navigate = useNavigate()
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
        fetchFolders()
    }, [])

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
                        <p className='patients-tab'>Documents Groups Clients</p>
                    </div>

                    <button className='patients-btn-ghost' onClick={() => setOpenFolderModal(true)}>
                        <span>＋</span>
                        <span>Folder</span>
                    </button>
                </div>

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
