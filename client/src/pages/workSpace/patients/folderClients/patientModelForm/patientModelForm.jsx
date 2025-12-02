import React, { useState, useEffect } from "react";
import "./patientModelForm.css";

export default function PatientModalForm({
  onClose,
  onSubmit,
  folders = [],
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
    folderId: initialFolderId || folders[0]?.id || "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      folderId: initialFolderId || folders[0]?.id || "",
    }));
  }, [folders, initialFolderId]);

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
      relationship:
        formData.role === "relative" ? formData.relationship : "None",
    };

    onSubmit?.(payload);
  };

  return (
    <div className="patient-modal-overlay" onClick={onClose}>
      <div className="patient-modal" onClick={(e) => e.stopPropagation()}>
        <button className="patient-modal-close" onClick={onClose} type="button">
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
                  formData.role === "patient" ? "role-option--active" : ""
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

              <label
                className={`role-option ${
                  formData.role === "relative" ? "role-option--active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="relative"
                  checked={formData.role === "relative"}
                  onChange={handleRoleChange}
                />
                <span>Relative</span>
              </label>
            </div>
          </div>

          {/* Relationship */}
          {formData.role === "relative" && (
            <div className="form-group">
              <label className="form-label">Relationship</label>
              <div className="input-with-icon">
                <select
                  name="relationship"
                  className="form-input"
                  value={formData.relationship}
                  onChange={handleChange}
                >
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Coworker">Coworker</option>
                  <option value="Partner">Partner</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

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
                {folders.length === 0 && (
                  <option value="">No folder available</option>
                )}

                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
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
