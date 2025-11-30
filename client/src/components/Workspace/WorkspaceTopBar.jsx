import "./WorkspaceTopBar.css";

export default function WorkspaceTopBar() {
  return (
    <header className="workspace-topbar">
      <div className="workspace-topbar-search-wrapper">
        <input
          className="workspace-topbar-search-input"
          placeholder="Search for ...."
        />
      </div>

      <div className="workspace-topbar-actions">
        <button className="workspace-topbar-btn">
          <span>＋</span>
          <span>Create Client</span>
        </button>

        <button className="workspace-topbar-btn workspace-topbar-btn-primary">
          Upgrade plus
        </button>

        <div className="workspace-topbar-user-pill">
          <div className="workspace-topbar-user-avatar" />
          <span>Dr. John Smith</span>
        </div>
      </div>
    </header>
  );
}
