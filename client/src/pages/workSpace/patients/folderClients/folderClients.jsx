import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./folderClients.css";
import folderIcon from "../../../../assets/folder.svg";
import PatientModalForm from "../folderClients/patientModelForm/patientModelForm";

export default function FolderClients() {
  const { folderId } = useParams();
  const location = useLocation();

  // folder truyền từ Patients qua navigate(..., { state: { folder } })
  const folderFromState = location.state?.folder;

  // mock cho các folder có sẵn (folder-1..3)
  const mockFolders = [
    {
      id: "folder-1",
      name: "Folder 1",
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
      clients: [],
    },
  ];

  // Ưu tiên folder truyền từ Patients, nếu không có thì fallback mock
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
      relationship: data.relationship,
    };

    setClients((prev) => [...prev, newClient]);
    setOpenCreateModal(false);
  };

  return (
    <section className="folder-page">
      <div className="folder-card">
        {/* HEADER */}
        <div className="folder-card-header">
          <div className="folder-info-main">
            <img src={folderIcon} className="folder-info-icon" alt="" />
            <div>
              <h1 className="folder-info-title">{folder.name}</h1>
              <p className="folder-info-subtitle">
                Total Clients: {filteredClients.length}
              </p>
            </div>
          </div>

          <div className="folder-description">
            {folder.description ? (
              <p>{folder.description}</p>
            ) : (
              <p className="folder-description-empty">No description</p>
            )}
          </div>

          <button
            className="folder-add-btn"
            onClick={() => setOpenCreateModal(true)}
          >
            <span>＋</span>
            <span>Add Client</span>
          </button>
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
                <th>No.</th>
                <th>Name</th>
                <th>Age</th>
                <th>Contact info</th>
                <th>Relationship</th>
                <th></th>
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
