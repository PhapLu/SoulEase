import { Outlet, NavLink } from "react-router-dom";
import "./WorkspaceLayout.css";
import logo from "../../assets/logo.svg";

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
                Clients
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace/dashboard"
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace/message"
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                Messages
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace/notifications"
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                Notifications
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace/settings"
                className={({ isActive }) =>
                  isActive ? "workspace-nav-link active" : "workspace-nav-link"
                }
              >
                Setting
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
