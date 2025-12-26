import React, { useState, useEffect } from "react";
import "./patientModelForm.css";
import { apiUtils } from "../../../../../utils/newRequest";

export default function PatientModalForm({
    onClose,
    onSubmit,
    initialFolderId = "",
    lockFolder = false,
}) {
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        dob: "",
        phoneNumber: "",
        role: "patient",
        relationship: "Family",
        folderId: initialFolderId,
    });
    const [doctorFolders, setDoctorFolders] = useState([]);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const res = await apiUtils.get("/folder/readFolders");
                const list = res.data?.metadata?.folders || [];

                setDoctorFolders(list);

                // set default folderId if not locked
                setFormData((prev) => ({
                    ...prev,
                    folderId: initialFolderId || list[0]?._id || "",
                }));
            } catch (err) {
                console.log("Failed to load folders", err);
            }
        };

        fetchFolders();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            role: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
        };

        onSubmit?.(payload);
    };

    return (
        <div className="patient-modal-overlay" onClick={onClose}>
            <div className="patient-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    className="patient-modal-close"
                    onClick={onClose}
                    type="button"
                >
                    ✕
                </button>

                <h2 className="patient-modal-title">Create client</h2>

                <form className="patient-form" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-with-icon">
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Full name */}
                    <div className="form-group">
                        <label className="form-label">Full name</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                name="fullName"
                                className="form-input"
                                placeholder="Enter full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Date of birth */}
                    <div className="form-group">
                        <label className="form-label">Date of birth</label>
                        <div className="input-with-icon">
                            <input
                                type="date"
                                name="dob"
                                className="form-input"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label className="form-label">Phone number</label>
                        <div className="input-with-icon">
                            <input
                                type="tel"
                                name="phoneNumber"
                                className="form-input"
                                placeholder="Enter phone number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="form-group">
                        <label className="form-label">Role</label>

                        <div className="role-group">
                            <label
                                className={`role-option ${
                                    formData.role === "patient"
                                        ? "role-option--active"
                                        : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value="patient"
                                    checked={formData.role === "patient"}
                                    onChange={handleRoleChange}
                                />
                                <span>Patient</span>
                            </label>
                        </div>
                    </div>

                    {/* Folder */}
                    <div className="form-group">
                        <label className="form-label">Folder</label>
                        <div className="input-with-icon">
                            <select
                                name="folderId"
                                className="form-input"
                                value={formData.folderId}
                                onChange={handleChange}
                                disabled={lockFolder}
                            >
                                {doctorFolders.length === 0 && (
                                    <option>No folder available</option>
                                )}

                                {doctorFolders.map((f) => (
                                    <option key={f._id} value={f._id}>
                                        {f.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="patient-submit-btn">
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
}
