// src/App.jsx
import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'

import Layout from './Layout.jsx'

import About from './pages/About/About.jsx'
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import SignIn from './pages/Auth/SignIn.jsx'
import SignUp from './pages/Auth/SignUp.jsx'
import AuthLayout from './pages/Auth/AuthLayout.jsx'
import Resources from './pages/Resources/Resources.jsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: 'about', element: <About /> },
            { path: 'resources', element: <Resources /> },
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
