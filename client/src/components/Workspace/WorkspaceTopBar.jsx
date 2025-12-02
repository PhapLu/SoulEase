import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./WorkspaceTopBar.css";

import PatientModalForm from "../../pages/workSpace/patients/folderClients/patientModelForm/patientModelForm";

export default function WorkspaceTopBar({ folders = [] }) {
  const { folderId } = useParams();
  const [showModal, setShowModal] = useState(false);

  const handleCreateClient = (payload) => {
    console.log("Create client payload:", payload);
    // TODO: call API
    setShowModal(false);
  };

  const isInsideFolder = !!folderId;

  return (
    <header className="workspace-topbar">
      <div className="workspace-topbar-search-wrapper">
        <input
          className="workspace-topbar-search-input"
          placeholder="Search for ...."
        />
      </div>

      <div className="workspace-topbar-actions">
        <button
          className="workspace-topbar-btn"
          onClick={() => setShowModal(true)}
        >
          <span>＋</span>
          <span>Create Client</span>
        </button>

        {/* MODAL */}
        {showModal && (
          <PatientModalForm
            onClose={() => setShowModal(false)}
            onSubmit={handleCreateClient}
            folders={folders}
            initialFolderId={folderId || ""}
            lockFolder={isInsideFolder}
          />
        )}

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
