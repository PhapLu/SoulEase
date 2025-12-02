import React, { useState } from "react";
import "./patientModelForm.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faCalendarDays,
  faPhone,
  faKey,
  faEye,
  faEyeSlash,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

export default function PatientModalForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    dob: "",
    phoneNumber: "",
    password: "",
    relationship: "None",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="patient-modal-overlay">
      <div className="patient-modal">
        <button className="patient-modal-close" onClick={onClose}>
          ✕
        </button>

        <h2 className="patient-modal-title">Create client</h2>

        <form className="patient-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
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
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="text"
                name="fullName"
                className="form-input"
                placeholder="Enter your full name"
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
              <FontAwesomeIcon icon={faCalendarDays} className="input-icon" />
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
              <FontAwesomeIcon icon={faPhone} className="input-icon" />
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

          {/* Relationship */}
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faHeart} className="input-icon" />
              <select
                name="relationship"
                className="form-input"
                value={formData.relationship}
                onChange={handleChange}
              >
                <option value="None">None</option>
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Coworker">Coworker</option>
                <option value="Partner">Partner</option>
                <option value="Neighbor">Neighbor</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon input-with-trailing-icon">
              <FontAwesomeIcon icon={faKey} className="input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="input-trailing-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
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
