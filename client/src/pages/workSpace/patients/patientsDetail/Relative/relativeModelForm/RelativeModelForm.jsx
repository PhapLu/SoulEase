import React, { useMemo, useState } from "react";
import "./RelativeModelForm.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RelativeModalForm({
    onClose,
    onSubmit,
}) {
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        phoneNumber: "",
        relationship: "Family",
        relationshipOther: "",
        role: "relative",
    });
    const [errors, setErrors] = useState({});

    const relationshipOptions = useMemo(
        () => [
            "Family",
            "Spouse",
            "Parent",
            "Child",
            "Sibling",
            "Caregiver",
            "Friend",
            "Other",
        ],
        []
    );


    const setField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phoneNumber") {
            const digits = String(value || "")
                .replace(/\D+/g, "")
                .slice(0, 10);
            setField(name, digits);
            return;
        }

        if (name === "relationship") {
            setField(name, value);
            if (value !== "Other") setField("relationshipOther", "");
            return;
        }

        setField(name, value);
    };

    const validate = () => {
        const next = {};

        const email = (formData.email || "").trim();
        const fullName = (formData.fullName || "").trim();
        const phone = String(formData.phoneNumber || "");
        const relationship = formData.relationship;

        if (!email) next.email = "Email is required.";
        else if (!EMAIL_RE.test(email)) next.email = "Invalid email format.";

        if (!fullName) next.fullName = "Full name is required.";

        // phone: optional? bạn muốn bắt buộc thì đổi thành if (!phone) ...
        if (phone && phone.length !== 10)
            next.phoneNumber = "Phone must be 10 digits.";

        if (relationship === "Other") {
            const other = (formData.relationshipOther || "").trim();
            if (!other) next.relationshipOther = "Please specify relationship.";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const relationshipFinal =
            formData.relationship === "Other"
                ? (formData.relationshipOther || "").trim()
                : formData.relationship;

        const payload = {
            email: formData.email.trim(),
            fullName: formData.fullName.trim(),
            phoneNumber: formData.phoneNumber,
            relationship: relationshipFinal,
            role: "relative",
        };

        onSubmit?.(payload);
    };

    return (
        <div className="relative-modal-overlay" onClick={onClose}>
            <div
                className="relative-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="relative-modal-close"
                    onClick={onClose}
                    type="button"
                >
                    ✕
                </button>

                <h2 className="relative-modal-title">Create relative</h2>

                <form className="relative-form" onSubmit={handleSubmit}>
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
                        {errors.email && (
                            <div className="form-error">{errors.email}</div>
                        )}
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
                        {errors.fullName && (
                            <div className="form-error">{errors.fullName}</div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label className="form-label">Phone number</label>
                        <div className="input-with-icon">
                            <input
                                type="tel"
                                name="phoneNumber"
                                className="form-input"
                                placeholder="10 digits"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                inputMode="numeric"
                                pattern="\d{10}"
                                maxLength={10}
                            />
                        </div>
                        {errors.phoneNumber && (
                            <div className="form-error">
                                {errors.phoneNumber}
                            </div>
                        )}
                    </div>

                    {/* Relationship */}
                    <div className="form-group">
                        <label className="form-label">Relationship</label>
                        <div className="input-with-icon">
                            <select
                                name="relationship"
                                className="form-input"
                                value={formData.relationship}
                                onChange={handleChange}
                            >
                                {relationshipOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.relationship === "Other" && (
                            <>
                                <div style={{ height: 8 }} />
                                <div className="input-with-icon">
                                    <input
                                        type="text"
                                        name="relationshipOther"
                                        className="form-input"
                                        placeholder="Specify relationship"
                                        value={formData.relationshipOther}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {errors.relationshipOther && (
                                    <div className="form-error">
                                        {errors.relationshipOther}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <button type="submit" className="relative-submit-btn">
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
}
