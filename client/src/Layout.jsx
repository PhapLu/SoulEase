import Header from './components/header/Header'
import Footer from './components/footer/Footer'
import { Outlet, useLocation } from 'react-router-dom'

import './Layout.css'
import FinisherBackground from './components/BackgroundApp/FinisherBackground'

const Layout = () => {
    const { pathname } = useLocation()
    const isLanding = pathname === '/'

    return (
        <>
            <div className={`app-layout ${isLanding ? 'landing-view' : ''}`}>
                <FinisherBackground />
                <Header />

                <main className='app-main'>
                    <Outlet />
                </main>

                <Footer />
            </div>
        </>
    )
}

export default Layout
