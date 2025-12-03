import React, { useState } from "react";
import "./doctorModelForm.css";

export default function DoctorModalForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialty: "",
    phoneNumber: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="doctor-modal-overlay">
      <div className="doctor-modal">
        <button className="doctor-modal-close" onClick={onClose}>
          ✕
        </button>

        <h2 className="doctor-modal-title">Create doctor</h2>

        <form className="doctor-form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full name</label>
            <div className="input-with-icon">
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter doctor's full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          {/* Specialty */}
          <div className="form-group">
            <label className="form-label">Specialty</label>
            <div className="input-with-icon">
              <input
                type="text"
                name="specialty"
                className="form-input"
                placeholder="e.g. Cardiology, Dermatology..."
                value={formData.specialty}
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

          {/* Description / Bio */}
          <div className="form-group">
            <label className="form-label">Description / Bio</label>
            <div className="input-with-icon">
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Short bio, experience, notes..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="doctor-submit-btn">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
