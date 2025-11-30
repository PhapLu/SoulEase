import React from "react";
import { useNavigate } from "react-router-dom";
import "./patients.css";
import folderIcon from "../../../assets/folder.svg";
import WorkspaceTopBar from "../../../components/Workspace/WorkspaceTopBar";

export default function Patients() {
  const navigate = useNavigate();

  // =============================
  // MOCK DATA CHUẨN
  // =============================
  const folders = [
    { id: "folder-1", name: "Folder 1" },
    { id: "folder-2", name: "Folder 2" },
    { id: "folder-3", name: "Folder 3" },
  ];

  return (
    <div className="patients">
      {/* TOP BAR */}
      <WorkspaceTopBar />

      {/* MAIN CARD */}
      <section className="patients-card">
        <div className="patients-card-top">
          <div className="patients-tabs">
            <p className="patients-tab">Documents Groups Clients</p>
          </div>

          <button className="patients-btn-ghost">
            <span>＋</span>
            <span>Folder</span>
          </button>
        </div>

        {/* GRID */}
        <div className="patients-folders-grid">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="patients-folder-item"
              onClick={() =>
                navigate(`/workspace/patients/folder/${folder.id}`)
              }
            >
              <img
                src={folderIcon}
                alt={folder.name}
                className="patients-folder-icon"
              />
              <span className="patients-folder-label">{folder.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
