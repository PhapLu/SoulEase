import { Outlet, NavLink } from "react-router-dom";
import "./WorkspaceLayout.css";
import logo from "../../assets/logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faChartPie,
  faComments,
  faBell,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

export default function WorkspaceLayout() {
  return (
    <div className="workspace">
      {/* LEFT SIDEBAR */}
      <aside className="workspace-sidebar">
        <div className="workspace-brand">
          <img src={logo} alt="SoulEase logo" className="workspace-logo" />
          <span className="workspace-brand-name">SoulEase</span>
        </div>

        <nav className="workspace-nav">
          <ul>
            <li>
              <NavLink
                to="/workspace/patients"
                end
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>Clients</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace/dashboard"
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                <FontAwesomeIcon icon={faChartPie} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace/messages"
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                <FontAwesomeIcon icon={faComments} />
                <span>Messages</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace/notifications"
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                <FontAwesomeIcon icon={faBell} />
                <span>Notifications</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace/settings"
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                <FontAwesomeIcon icon={faGear} />
                <span>Setting</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="workspace-footer">
          <p>Copyright © 2025 SoulEase.</p>
          <img
            src={logo}
            alt="SoulEase logo small"
            className="workspace-footer-logo"
          />
        </div>
      </aside>

      {/* MAIN CONTENT - 10/12 col */}
      <main className="workspace-main">
        <Outlet />
      </main>
    </div>
  );
}
