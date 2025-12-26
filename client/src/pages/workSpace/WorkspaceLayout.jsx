import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import './WorkspaceLayout.css'
import logo from '../../assets/logo.svg'
import FinisherHeader from '../../components/BackgroundApp/FinisherHeader'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useEffect, useState } from 'react'
import { apiUtils } from '../../utils/newRequest'

export default function WorkspaceLayout() {
    const { userInfo } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [patientRecord, setPatientRecord] = useState(null)

    useEffect(() => {
        // only run on /workspace exactly
        if (location.pathname !== '/workspace') return
        if (!userInfo) return
        if (userInfo.role === 'clinic') {
            navigate('/workspace/staffs', { replace: true })
        } else if (userInfo.role === 'doctor' || userInfo.role === 'nurse') {
            navigate('/workspace/patients', { replace: true })
        }
    }, [userInfo, location.pathname, navigate])

    useEffect(() => {
        if (!userInfo) return
        if (userInfo.role !== 'member') return
        if (location.pathname !== '/workspace') return

        const fetchMyRecord = async () => {
            try {
                const patientId = userInfo._id

                const res = await apiUtils.get(`/patientRecord/readPatientRecord/${patientId}`)

                const record = res?.data?.metadata?.patientRecord || res?.data?.patientRecord

                setPatientRecord(record)
            } catch (err) {
                console.error('Failed to fetch patient record', err)
                navigate('/workspace/notifications', { replace: true })
            }
        }

        fetchMyRecord()
    }, [userInfo, location.pathname, navigate])

    useEffect(() => {
        if (!patientRecord) return

        const folderId = patientRecord.folderId
        const patientId = patientRecord.patientId || patientRecord._id

        if (folderId && patientId) {
            navigate(`/workspace/patients/folder/${folderId}/${patientId}`, { replace: true })
            return
        }

        navigate(`/workspace/patients/${patientId}/profiles`, {
            replace: true,
        })
    }, [patientRecord, navigate])

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'family') return
        const blockedPaths = new Set(['/workspace', '/workspace/patients'])
        if (!blockedPaths.has(location.pathname)) return
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
    }, [userInfo, location.pathname, navigate])

    return (
        <>
            <FinisherHeader />
            <div className='workspace'>
                <aside className='workspace-sidebar'>
                    <Link to='/workspace' className='workspace-brand'>
                        <img src={logo} alt='SoulEase logo' className='workspace-logo' />
                        <div className='workspace-brand-name'>SoulEase</div>
                    </Link>

                    <nav className='workspace-nav'>
                        <ul>
                            {(userInfo?.role === 'doctor' || userInfo?.role === 'nurse') && (
                                <li>
                                    <NavLink to='/workspace/patients' end className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                        <span>
                                            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#737373'>
                                                <path d='M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM358-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42Zm360-150q0 66-42 108t-108 42q-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108ZM98-220h520v-34q0-16-9.5-31T585-306q-72-32-121-43t-106-11q-57 0-106.5 11T130-306q-14 6-23 21t-9 31v34Zm260-321q39 0 64.5-25.5T448-631q0-39-25.5-64.5T358-721q-39 0-64.5 25.5T268-631q0 39 25.5 64.5T358-541Zm0 321Zm0-411Z' />
                                            </svg>
                                        </span>
                                        Patients
                                    </NavLink>
                                </li>
                            )}

                            {userInfo?.role === 'clinic' && (
                                <li>
                                    <NavLink to='/workspace/staffs' end className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                        <span>
                                            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#737373'>
                                                <path d='M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM358-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42Zm360-150q0 66-42 108t-108 42q-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108ZM98-220h520v-34q0-16-9.5-31T585-306q-72-32-121-43t-106-11q-57 0-106.5 11T130-306q-14 6-23 21t-9 31v34Zm260-321q39 0 64.5-25.5T448-631q0-39-25.5-64.5T358-721q-39 0-64.5 25.5T268-631q0 39 25.5 64.5T358-541Zm0 321Zm0-411Z' />
                                            </svg>
                                        </span>
                                        Staffs
                                    </NavLink>
                                </li>
                            )}

                            {(userInfo?.role === 'member' || userInfo?.role === 'family') && (
                                <li>
                                    <NavLink to={`/patientRecord/${userInfo?._id}`} end className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                        <span>
                                            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#737373'>
                                                <path d='M200-200v-560 179-19 400Zm80-240h221q2-22 10-42t20-38H280v80Zm0 160h157q17-20 39-32.5t46-20.5q-4-6-7-13t-5-14H280v80Zm0-320h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v258q-14-26-34-46t-46-33v-179H200v560h202q-1 6-1.5 12t-.5 12v56H200Zm480-200q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM480-120v-56q0-24 12.5-44.5T528-250q36-15 74.5-22.5T680-280q39 0 77.5 7.5T832-250q23 9 35.5 29.5T880-176v56H480Z' />
                                            </svg>
                                        </span>
                                        Your Record
                                    </NavLink>
                                </li>
                            )}

                            <li>
                                <NavLink to='/workspace/messages' className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    <span>
                                        <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#737373'>
                                            {' '}
                                            <path d='M240-384h336v-72H240v72Zm0-132h480v-72H240v72Zm0-132h480v-72H240v72ZM96-96v-696q0-29.7 21.15-50.85Q138.3-864 168-864h624q29.7 0 50.85 21.15Q864-821.7 864-792v480q0 29.7-21.15 50.85Q821.7-240 792-240H240L96-96Zm114-216h582v-480H168v522l42-42Zm-42 0v-480 480Z' />{' '}
                                        </svg>
                                    </span>
                                    Messages
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to='/workspace/notifications' className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    <span>
                                        <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#737373'>
                                            {' '}
                                            <path d='M192-216v-72h48v-240q0-87 53.5-153T432-763v-53q0-20 14-34t34-14q20 0 34 14t14 34v53q85 16 138.5 82T720-528v240h48v72H192Zm288-276Zm-.21 396Q450-96 429-117.15T408-168h144q0 30-21.21 51t-51 21ZM312-288h336v-240q0-70-49-119t-119-49q-70 0-119 49t-49 119v240Z' />{' '}
                                        </svg>
                                    </span>
                                    Notifications
                                </NavLink>
                            </li>
                        </ul>
                    </nav>

                    <div className='workspace-footer'>
                        <p>Copyright © 2025 SoulEase.</p>
                        <img src={logo} alt='SoulEase logo small' className='workspace-footer-logo' />
                    </div>
                </aside>

                <main className='workspace-main'>
                    <Outlet />
                </main>
            </div>
        </>
    )
}
