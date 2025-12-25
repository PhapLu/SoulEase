// src/App.jsx
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Layout from "./Layout.jsx";
import About from "./pages/about/About.jsx";
import LandingPage from "./pages/landingPage/LandingPage.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import SignUp from "./pages/auth/SignUp.jsx";
import AuthLayout from "./pages/auth/AuthLayout.jsx";
import Verification from "./pages/auth/Verification.jsx";
import ResourcesPage from "./pages/Resources/Resources.jsx";
import WorkspaceLayout from "./pages/workSpace/WorkspaceLayout.jsx";
// import RequireAuth from './components/Auth/RequireAuth.jsx'
import Patients from "./pages/workSpace/patients/patients.jsx";
import FolderClients from "./pages/workSpace/patients/folderClients/folderClients.jsx";
import PatientsDetail from "./pages/workSpace/patients/patientsDetail/patientsDetail.jsx";
import Services from "./pages/Services/Services";
import Pricing from "./pages/Pricing/Pricing";
// import Messages from './pages/workSpace/conversation/Conversations.jsx'
import Staffs from "./pages/workSpace/staffs/Staffs.jsx";
import Notifications from "./pages/workSpace/notifications/Notifications.jsx";
import StaffDetail from "./pages/workSpace/staffs/staffDetail/StaffDetail.jsx";
import MessagesList from "./components/conversation/conversations/Conversations.jsx";
import ConversationDetail from "./components/conversation/conversationDetail/ConversationDetail.jsx";
import ConversationsLayout from "./pages/workSpace/conversation/ConversationsLayout.jsx";
import TreatmentDetailPage from "./pages/workSpace/patients/patientsDetail/TreatmentSection/TreatmentDetailPage.jsx";
import CreateSessionPage from "./pages/workSpace/patients/patientsDetail/TreatmentSection/CreateSessionPage.jsx";
import PatientsProfilePage from "./pages/workSpace/patients/patientsProfile/PatientsProfilePage.jsx";
// import Message from "./pages/workSpace/message/message.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: "about", element: <About /> },
            { path: "resources", element: <ResourcesPage /> },
            { path: "services", element: <Services /> },
            { path: "pricing", element: <Pricing /> },
        ],
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            { path: "signin", element: <SignIn /> },
            { path: "signup", element: <SignUp /> },
            { path: "verification", element: <Verification /> },
        ],
    },
    {
        path: "/workspace",
        element: (
            // <RequireAuth>
            <WorkspaceLayout />
            // </RequireAuth>
        ),
        children: [
            { path: "patients", element: <Patients /> },
            { path: "staffs", element: <Staffs /> },
            { path: "patients/folder/:folderId", element: <FolderClients /> },
            {
                path: "patients/folder/:folderId/:patientRecordId",
                element: <PatientsDetail />,
            },
            { path: "staffs/:staffId", element: <StaffDetail /> },
            {
                path: "messages",
                element: <ConversationsLayout />,
                children: [{ path: ":conversationId", element: null }],
            },
            { path: "notifications", element: <Notifications /> },
            {
                path: "patients/folder/:folderId/:patientRecordId/treatment",
                element: <TreatmentDetailPage />,
            },
            {
                path: "patients/folder/:folderId/:patientRecordId/treatment/create-session",
                element: <CreateSessionPage />,
            },
            {
                path: "patients/:patientRecordId/profiles",
                element: <PatientsDetail />,
            },
        ],
    },
]);

export default function App() {
    useEffect(() => {
        AOS.init({
            duration: 800,
            offset: 100,
            easing: "ease-out-cubic",
            once: false,
        });
    }, []);

    return <RouterProvider router={router} />;
}
