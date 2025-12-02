import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./patients.css";
import folderIcon from "../../../assets/folder.svg";
import WorkspaceTopBar from "../../../components/Workspace/WorkspaceTopBar";
import FolderModalForm from "./folderClients/folderModelForm/folderModelForm";

export default function Patients() {
  const navigate = useNavigate();
  const [openFolderModal, setOpenFolderModal] = useState(false);

  const [folders, setFolders] = useState([
    {
      id: "folder-1",
      name: "Folder 1",
      description: "sadbaskjdbskau",
      clients: [],
    },
    { id: "folder-2", name: "Folder 2", description: "", clients: [] },
    { id: "folder-3", name: "Folder 3", description: "", clients: [] },
    { id: "folder-4", name: "Folder 4", description: "", clients: [] },
    { id: "folder-5", name: "Folder 5", description: "", clients: [] },
    { id: "folder-6", name: "Folder 6", description: "", clients: [] },
  ]);

  const handleCreateFolder = (data) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: data.name,
      description: data.description,
      clients: [],
    };

    setFolders((prev) => [...prev, newFolder]);
    setOpenFolderModal(false);
  };

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
                navigate(`/workspace/patients/folder/${folder.id}`, {
                  state: { folder },
                })
              }
            >
              <img src={folderIcon} alt={folder.name} />
              <span>{folder.name}</span>
            </div>
          ))}
        </div>
      </section>

      {openFolderModal && (
        <FolderModalForm
          onClose={() => setOpenFolderModal(false)}
          onSubmit={handleCreateFolder}
        />
      )}
    </div>
  );
}
