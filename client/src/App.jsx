// src/App.jsx
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Layout from "./Layout.jsx";
import About from "./pages/About/About.jsx";
import SignIn from "./pages/Auth/SignIn.jsx";
import SignUp from "./pages/Auth/SignUp.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <About /> },
      { path: "about", element: <About /> },
    ],
  },
  { path: "auth/signin", element: <SignIn /> },
  { path: "auth/signup", element: <SignUp /> },
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
