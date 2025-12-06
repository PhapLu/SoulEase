import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import "./folderClients.css";
import folderIcon from "../../../../assets/folder.svg";
import PatientModalForm from "../folderClients/patientModelForm/patientModelForm";
import WorkspaceTopBar from "../../../../components/Workspace/WorkspaceTopBar";
import { apiUtils } from "../../../../utils/newRequest";

export default function FolderClients() {
    const navigate = useNavigate();
    const { folderId } = useParams();
    const location = useLocation();

    const [showModal, setShowModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("lastName");

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [folderInfo, setFolderInfo] = useState({
        title: "",
        description: "",
    });

    useEffect(() => {
        const fetchFolder = async () => {
            try {
                setIsLoading(true);
                setError("");

                const res = await apiUtils.get("/folder/readFolders");
                const folders = res.data.metadata.folders || [];

                const current = folders.find((f) => f._id === folderId);

                if (current) {
                    setFolderInfo({
                        title: current.title,
                        description: current.description,
                    });
                    setClients(current.clients || []);
                } else {
                    setError("Folder not found.");
                }
            } catch (err) {
                console.log("Failed to load folder:", err);
                setError("Failed to load folder.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFolder();
    }, [folderId]);

    const filteredClients = useMemo(() => {
        let data = clients.filter((client) =>
            `${client.firstName} ${client.lastName}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );

        if (sortBy === "lastName") {
            data = [...data].sort((a, b) =>
                a.lastName.localeCompare(b.lastName)
            );
        } else if (sortBy === "firstName") {
            data = [...data].sort((a, b) =>
                a.firstName.localeCompare(b.firstName)
            );
        } else if (sortBy === "age") {
            data = [...data].sort((a, b) => a.age - b.age);
        }

        return data;
    }, [clients, search, sortBy]);

    const handleCreateClient = (data) => {
        const parts = data.fullName.trim().split(" ");
        const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
        const firstName =
            parts.length > 1
                ? parts.slice(0, parts.length - 1).join(" ")
                : parts[0];

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

    const handleStartEdit = () => {
        setEditTitle(folderInfo.title);
        setEditDescription(folderInfo.description);
        setIsEditing(true);
    };

    const handleDeleteEdit = async () => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this folder? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
        setIsSaving(true);
        await apiUtils.delete(`/folder/deleteFolder/${folderId}`);

        console.log("Folder deleted successfully");
        navigate("/workspace/patients")
    } catch (err) {
        console.log("Failed to delete folder:", err);
        alert("Failed to delete folder. Please try again.");
    } finally {
        setIsSaving(false);
    }
};

    const handleSaveEdit = async () => {
        const payload = {
            title: editTitle.trim() || "Untitled Folder",
            description: editDescription.trim(),
        };

        try {
            setIsSaving(true);
            const res = await apiUtils.patch(
                `/folder/updateFolder/${folderId}`,
                payload
            );
            const updatedFolder = res.data.metadata.folder || payload;
            setFolderInfo({
                title: updatedFolder.title,
                description: updatedFolder.description,
            });
            setIsEditing(false);
            console.log("Update success");
        } catch (err) {
            console.log("Failed to load folders:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditTitle(folderInfo.title);
        setEditDescription(folderInfo.description);
        setIsEditing(false);
    };

    return (
        <>
            <section className="folder-page">
                <WorkspaceTopBar />
                <div className="folder-card">
                    {/* HEADER */}
                    <div className="folder-card-header">
                        <div className="folder-info-main">
                            <img
                                src={folderIcon}
                                className="folder-info-icon"
                                alt=""
                            />

                            {isEditing ? (
                                <div className="folder-edit-fields">
                                    <input
                                        type="text"
                                        className="folder-edit-input"
                                        value={editTitle}
                                        onChange={(e) =>
                                            setEditTitle(e.target.value)
                                        }
                                        placeholder="Folder name"
                                    />

                                    <textarea
                                        className="folder-edit-textarea"
                                        value={editDescription}
                                        onChange={(e) =>
                                            setEditDescription(e.target.value)
                                        }
                                        placeholder="Folder description..."
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h1 className="folder-info-title">
                                        {folderInfo.title ? (
                                            <p>{folderInfo.title}</p>
                                        ) : (
                                            <p className="folder-empty-fill">
                                                No Folder Name
                                            </p>
                                        )}
                                    </h1>
                                    <p className="folder-info-subtitle">
                                        Total Clients: {filteredClients.length}
                                    </p>
                                </div>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="folder-description">
                                {folderInfo.description ? (
                                    <p>{folderInfo.description}</p>
                                ) : (
                                    <p className="folder-empty-fill">
                                        No description
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="folder-header-actions-row">
                            {isEditing ? (
                                <>
                                    <button
                                        className="folder-save-btn"
                                        onClick={handleSaveEdit}
                                    >
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
                                <button
                                    className="folder-edit-btn"
                                    onClick={handleStartEdit}
                                >
                                    <span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="16px"
                                            viewBox="0 -960 960 960"
                                            width="16px"
                                            fill="#0c1317"
                                        >
                                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                                        </svg>
                                    </span>
                                    <span>Edit</span>
                                </button>
                            )}

                            <button
                                className="folder-add-btn"
                                onClick={() => setOpenCreateModal(true)}
                            >
                                <span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20px"
                                        viewBox="0 -960 960 960"
                                        width="20px"
                                        fill="#0c1317"
                                    >
                                        <path d="M444-144v-300H144v-72h300v-300h72v300h300v72H516v300h-72Z" />
                                    </svg>
                                </span>
                                <span>Add Client</span>
                            </button>

                            <button
                                className="folder-btn-delete"
                                onClick={handleDeleteEdit}
                            >
                                <span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20px"
                                        viewBox="0 -960 960 960"
                                        width="20px"
                                        fill="#ef4444"
                                    >
                                        <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" />
                                    </svg>
                                </span>
                            </button>
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
                                            <Link
                                                to={`/workspace/patients/folder/${folderId}/${client._id}`}
                                                className="folder-name-link"
                                            >
                                                {client.firstName}{" "}
                                                {client.lastName}
                                            </Link>
                                        </td>
                                        <td>{client.age}</td>
                                        <td className="folder-contact-cell">
                                            <div>{client.phone}</div>
                                            <div>{client.email}</div>
                                        </td>
                                        <td>{client.relationship}</td>
                                        <td>
                                            <button className="folder-delete-btn">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    height="24px"
                                                    viewBox="0 -960 960 960"
                                                    width="24px"
                                                    fill="#ef4444"
                                                >
                                                    <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="folder-empty"
                                        >
                                            No clients found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL */}
                {openCreateModal && (
                    <PatientModalForm
                        onClose={() => setOpenCreateModal(false)}
                        onSubmit={handleCreateClient}
                    />
                )}
            </section>
        </>
    );
}
