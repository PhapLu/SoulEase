import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";

const router = createBrowserRouter([
  { path: "/", element: <SignIn /> },
  { path: "/signin", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
