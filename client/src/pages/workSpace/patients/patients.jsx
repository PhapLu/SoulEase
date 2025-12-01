import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./patients.css";
import folderIcon from "../../../assets/folder.svg";
import WorkspaceTopBar from "../../../components/Workspace/WorkspaceTopBar";
import FolderModalForm from "./folderClients/folderModelForm/folderModelForm";

export default function Patients() {
  const navigate = useNavigate();
  const [openFolderModal, setOpenFolderModal] = useState(false);

  const folders = [
    { id: "folder-1", name: "Folder 1" },
    { id: "folder-2", name: "Folder 2" },
    { id: "folder-3", name: "Folder 3" },
    { id: "folder-4", name: "Folder 4" },
    { id: "folder-5", name: "Folder 5" },
    { id: "folder-6", name: "Folder 6" },
  ];

  return (
    <div className="patients">
      <WorkspaceTopBar />

      <section className="patients-card">
        <div className="patients-card-top">
          <div className="patients-tabs">
            <p className="patients-tab">Documents Groups Clients</p>
          </div>

          <button
            className="patients-btn-ghost"
            onClick={() => setOpenFolderModal(true)}
          >
            <span>＋</span>
            <span>Folder</span>
          </button>
        </div>

        <div className="patients-folders-grid">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="patients-folder-item"
              onClick={() =>
                navigate(`/workspace/patients/folder/${folder.id}`)
              }
            >
              <img src={folderIcon} alt={folder.name} />
              <span>{folder.name}</span>
            </div>
          ))}
        </div>
      </section>

      {openFolderModal && (
        <FolderModalForm onClose={() => setOpenFolderModal(false)} />
      )}
    </div>
  );
}
