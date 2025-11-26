import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { Outlet } from "react-router-dom";

import "./Layout.css";
import FinisherBackground from "./components/BackgroundApp/FinisherBackground";

const Layout = () => {
  return (
    <>
      <div className="app-layout">
      <FinisherBackground />
        <Header />

        <main className="app-main">
          
          <Outlet />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Layout;
