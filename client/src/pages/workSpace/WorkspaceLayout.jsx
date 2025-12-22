import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import './WorkspaceLayout.css'
import logo from '../../assets/logo.svg'
import FinisherHeader from '../../components/BackgroundApp/FinisherHeader'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useEffect } from 'react'

export default function WorkspaceLayout() {
    const { userInfo } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // only run on /workspace exactly
        if (location.pathname !== '/workspace') return
        if (!userInfo) return

        if (userInfo.role === 'clinic') {
            navigate('/workspace/doctors', { replace: true })
        } else if (userInfo.role === 'doctor') {
            navigate('/workspace/patients', { replace: true })
        }
    }, [userInfo, location.pathname, navigate])
    return (
        <>
            <FinisherHeader />
            <div className='workspace'>
                {/* LEFT SIDEBAR */}
                <aside className='workspace-sidebar'>
                    <Link to='/workspace' className='workspace-brand'>
                        <img src={logo} alt='SoulEase logo' className='workspace-logo' />
                        <div className='workspace-brand-name'>SoulEase</div>
                    </Link>

                    <nav className='workspace-nav'>
                        <ul>
                            {userInfo?.role === 'doctor' && (
                                <li>
                                    <NavLink to='/workspace/patients' end className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                        <span>
                                            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#737373'>
                                                <path d='M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM358-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42Zm360-150q0 66-42 108t-108 42q-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108ZM98-220h520v-34q0-16-9.5-31T585-306q-72-32-121-43t-106-11q-57 0-106.5 11T130-306q-14 6-23 21t-9 31v34Zm260-321q39 0 64.5-25.5T448-631q0-39-25.5-64.5T358-721q-39 0-64.5 25.5T268-631q0 39 25.5 64.5T358-541Zm0 321Zm0-411Z' />
                                            </svg>
                                        </span>
                                        Clients
                                    </NavLink>
                                </li>
                            )}

                            {userInfo?.role === 'clinic' && (
                                <li>
                                    <NavLink to='/workspace/doctors' end className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                        <span>
                                            <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#737373'>
                                                <path d='M38-160v-94q0-35 18-63.5t50-42.5q73-32 131.5-46T358-420q62 0 120 14t131 46q32 14 50.5 42.5T678-254v94H38Zm700 0v-94q0-63-32-103.5T622-423q69 8 130 23.5t99 35.5q33 19 52 47t19 63v94H738ZM358-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42Zm360-150q0 66-42 108t-108 42q-11 0-24.5-1.5T519-488q24-25 36.5-61.5T568-631q0-45-12.5-79.5T519-774q11-3 24.5-5t24.5-2q66 0 108 42t42 108ZM98-220h520v-34q0-16-9.5-31T585-306q-72-32-121-43t-106-11q-57 0-106.5 11T130-306q-14 6-23 21t-9 31v34Zm260-321q39 0 64.5-25.5T448-631q0-39-25.5-64.5T358-721q-39 0-64.5 25.5T268-631q0 39 25.5 64.5T358-541Zm0 321Zm0-411Z' />
                                            </svg>
                                        </span>
                                        Doctors
                                    </NavLink>
                                </li>
                            )}

                            <li>
                                <NavLink to='/workspace/messages' className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    <span>
                                        <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#737373'>
                                            <path d='M240-384h336v-72H240v72Zm0-132h480v-72H240v72Zm0-132h480v-72H240v72ZM96-96v-696q0-29.7 21.15-50.85Q138.3-864 168-864h624q29.7 0 50.85 21.15Q864-821.7 864-792v480q0 29.7-21.15 50.85Q821.7-240 792-240H240L96-96Zm114-216h582v-480H168v522l42-42Zm-42 0v-480 480Z' />
                                        </svg>
                                    </span>
                                    Messages
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to='/workspace/notifications' className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    <span>
                                        <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#737373'>
                                            <path d='M192-216v-72h48v-240q0-87 53.5-153T432-763v-53q0-20 14-34t34-14q20 0 34 14t14 34v53q85 16 138.5 82T720-528v240h48v72H192Zm288-276Zm-.21 396Q450-96 429-117.15T408-168h144q0 30-21.21 51t-51 21ZM312-288h336v-240q0-70-49-119t-119-49q-70 0-119 49t-49 119v240Z' />
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

                {/* MAIN CONTENT - 10/12 col */}
                <main className='workspace-main'>
                    <Outlet />
                </main>
            </div>
        </>
    )
}
