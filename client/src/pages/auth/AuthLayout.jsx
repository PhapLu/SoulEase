import { Outlet } from "react-router-dom";
import FinisherHeader from "../../components/BackgroundApp/FinisherHeader.jsx";
import "../../assets/css/base.scss";

export default function AuthLayout() {
  return (
    <>
      <FinisherHeader />
    
      <div className="app-layer">
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}