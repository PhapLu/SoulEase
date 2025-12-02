import { Outlet, NavLink } from 'react-router-dom'
import './WorkspaceLayout.css'
import logo from '../../assets/logo.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faChartPie, faComments, faBell, faGear } from '@fortawesome/free-solid-svg-icons'
import FinisherHeader from '../../components/BackgroundApp/FinisherHeader'

export default function WorkspaceLayout() {
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
                            <li>
                                <NavLink to='/workspace/patients' end className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    Clients
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to='/workspace/dashboard' className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to='/workspace/message' className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    Messages
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to='/workspace/notifications' className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    Notifications
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to='/workspace/settings' className={({ isActive }) => (isActive ? 'workspace-nav-link active' : 'workspace-nav-link')}>
                                    Setting
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
