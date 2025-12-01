// src/App.jsx
import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import logo from '../src/assets/logo.svg'

import Layout from './Layout.jsx'

import About from './pages/about/About.jsx'
import LandingPage from './pages/landingPage/LandingPage.jsx'
import SignIn from './pages/auth/SignIn.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import AuthLayout from './pages/auth/AuthLayout.jsx'
import ResourcesPage from './pages/Resources/Resources.jsx'

import WorkspaceLayout from './pages/workSpace/WorkspaceLayout.jsx'
import RequireAuth from './components/Auth/RequireAuth.jsx'

import Patients from './pages/workSpace/patients/patients.jsx'
// import Message from "./pages/workSpace/message/message.jsx";
import FolderClients from './pages/workSpace/patients/folderClients/folderClients.jsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: 'about', element: <About /> },
            { path: 'resources', element: <ResourcesPage /> },
            { path: 'services', element: <Services /> },
            { path: 'pricing', element: <Pricing /> },
        ],
    },
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            { path: 'signin', element: <SignIn /> },
            { path: 'signup', element: <SignUp /> },
        ],
    },
    {
        path: '/workspace',
        element: (
            <RequireAuth>
                <WorkspaceLayout />
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: (
                    <div>
                        <img src={logo} alt='SoulEase logo' className='logo' />
                    </div>
                ),
            },
            { path: 'patients', element: <Patients /> },
            // { path: "message", element: <Message /> },
            { path: 'patients/folder/:folderId', element: <FolderClients /> },
        ],
    },
])

export default function App() {
    useEffect(() => {
        AOS.init({
            duration: 800,
            offset: 100,
            easing: 'ease-out-cubic',
            once: false,
        })
    }, [])

    return <RouterProvider router={router} />
}
