import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./folderClients.css";
import folderIcon from "../../../../assets/folder.svg";
import PatientModalForm from "../folderClients/patientModelForm/patientModelForm";

export default function FolderClients() {
  const { folderId } = useParams();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const folderFromState = location.state?.folder;

  const mockFolders = [
    {
      id: "folder-1",
      name: "Folder 1",
      description: "This is a demo folder for testing.",
      clients: [
        {
          id: "client-101",
          firstName: "John",
          lastName: "Dante",
          age: 19,
          phone: "091234567",
          email: "abc@gmail.com",
          relationship: "None",
        },
        {
          id: "client-102",
          firstName: "Sarah",
          lastName: "Kim",
          age: 22,
          phone: "090111222",
          email: "sarah.kim@gmail.com",
          relationship: "Friend",
        },
        {
          id: "client-103",
          firstName: "Leo",
          lastName: "Tran",
          age: 30,
          phone: "098765432",
          email: "leo.tran@gmail.com",
          relationship: "Brother",
        },
      ],
    },
    {
      id: "folder-2",
      name: "Family Folder",
      description: "Folder for family members.",
      clients: [
        {
          id: "client-201",
          firstName: "Anna",
          lastName: "Lopez",
          age: 26,
          phone: "0933445566",
          email: "anna.lopez@gmail.com",
          relationship: "Sister",
        },
      ],
    },
    {
      id: "folder-3",
      name: "Empty Folder",
      description: "",
      clients: [],
    },
  ];

  const handleAddClient = (payload) => {
    console.log("Add client to current folder:", payload);
    // payload.folderId = folderId in URL
    setShowModal(false);
  };

  const folder =
    folderFromState && folderFromState.id === folderId
      ? {
          ...folderFromState,
          clients: folderFromState.clients || [],
        }
      : mockFolders.find((f) => f.id === folderId);

  if (!folder) {
    return <h2 style={{ padding: "2rem" }}>Folder not found</h2>;
  }

  const [folderInfo, setFolderInfo] = useState({
    name: folder.name,
    description: folder.description || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folderInfo.name);
  const [editDescription, setEditDescription] = useState(
    folderInfo.description
  );

  const [clients, setClients] = useState(folder.clients || []);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("lastName");
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const filteredClients = useMemo(() => {
    let data = clients;

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(s)
      );
    }

    if (sortBy === "lastName") {
      data = [...data].sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else if (sortBy === "firstName") {
      data = [...data].sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (sortBy === "age") {
      data = [...data].sort((a, b) => a.age - b.age);
    }

    return data;
  }, [search, sortBy, clients]);

  const handleCreateClient = (data) => {
    const parts = data.fullName.trim().split(" ");
    const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
    const firstName =
      parts.length > 1 ? parts.slice(0, parts.length - 1).join(" ") : parts[0];

    const birthYear = data.dob ? new Date(data.dob).getFullYear() : null;
    const currentYear = new Date().getFullYear();
    const age = birthYear ? currentYear - birthYear : 0;

    const newClient = {
      id: `client-${Date.now()}`,
      firstName,
      lastName,
      age,
      phone: data.phoneNumber,
      email: data.email,
      role: data.role,
      relationship: data.relationship,
      folderId: data.folderId,
    };

    setClients((prev) => [...prev, newClient]);
    setOpenCreateModal(false);
  };

  const handleStartEdit = () => {
    setEditName(folderInfo.name);
    setEditDescription(folderInfo.description);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // TODO: call API
    setFolderInfo({
      name: editName.trim() || "Untitled Folder",
      description: editDescription.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(folderInfo.name);
    setEditDescription(folderInfo.description);
    setIsEditing(false);
  };

  return (
    <section className="folder-page">
      <div className="folder-card">
        {/* HEADER */}
        <div className="folder-card-header">
          {/* LEFT: icon + title + clients count + (edit mode) */}
          <div className="folder-info-main">
            <img src={folderIcon} className="folder-info-icon" alt="" />

            {isEditing ? (
              <div className="folder-edit-fields">
                <input
                  type="text"
                  className="folder-edit-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Folder name"
                />

                <textarea
                  className="folder-edit-textarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Folder description..."
                />
              </div>
            ) : (
              <div>
                <h1 className="folder-info-title">{folderInfo.name}</h1>
                <p className="folder-info-subtitle">
                  Total Clients: {filteredClients.length}
                </p>
              </div>
            )}
          </div>

          {/* MIDDLE: description */}
          {!isEditing && (
            <div className="folder-description">
              {folderInfo.description ? (
                <p>{folderInfo.description}</p>
              ) : (
                <p className="folder-description-empty">No description</p>
              )}
            </div>
          )}

          {/* RIGHT: Edit / Save / Cancel + Add client */}
          <div className="folder-header-actions-row">
            {isEditing ? (
              <>
                <button className="folder-save-btn" onClick={handleSaveEdit}>
                  Save
                </button>

                <button
                  className="folder-cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="folder-edit-btn" onClick={handleStartEdit}>
                ✎ Edit
              </button>
            )}

            <>
              <button
                className="folder-add-btn"
                onClick={() => setOpenCreateModal(true)}
              >
                <span>＋</span>
                <span>Add Client</span>
              </button>

              {showModal && (
                <PatientModalForm
                  onClose={() => setShowModal(false)}
                  onSubmit={handleAddClient}
                  folders={folders}
                  initialFolderId={folderId}
                  lockFolder={true}
                />
              )}
            </>
          </div>
        </div>

        {/* SEARCH + SORT */}
        <div className="folder-controls">
          <div className="folder-search-wrapper">
            <input
              type="search"
              placeholder="Search client ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="folder-search-input"
            />
          </div>

          <div className="folder-sort-wrapper">
            <label className="folder-sort-label">Sort:</label>
            <select
              className="folder-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="lastName">Last name</option>
              <option value="firstName">First name</option>
              <option value="age">Age</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="folder-table-wrapper">
          <table className="folder-table">
            <thead>
              <tr>
                <th className="folder-col-number">No.</th>
                <th>Name</th>
                <th>Age</th>
                <th>Contact info</th>
                <th>Relationship</th>
                <th className="folder-col-actions"></th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client, index) => (
                <tr key={client.id}>
                  <td>{index + 1}.</td>
                  <td>
                    <button className="folder-name-link">
                      {client.firstName} {client.lastName}
                    </button>
                  </td>
                  <td>{client.age}</td>
                  <td className="folder-contact-cell">
                    <div>{client.phone}</div>
                    <div>{client.email}</div>
                  </td>
                  <td>{client.relationship}</td>
                  <td>
                    <button className="folder-delete-btn">🗑</button>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="folder-empty">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Client */}
      {openCreateModal && (
        <PatientModalForm
          onClose={() => setOpenCreateModal(false)}
          onSubmit={handleCreateClient}
        />
      )}
    </section>
  );
}
