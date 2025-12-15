import { AddIcon, EditIcon, RemoveIcon } from "../../Icons";
import InfoField from "./PatientInfoField";

export default function PatientsHeader({
    patient,
    editForm,
    isEditing,
    saving,
    onFieldChange,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
}) {
    return (
        <section className="pd-header">
            <div className="pd-avatar" />
            <div className="pd-info">
                <div className="pd-info__row">
                    <h2>
                        {isEditing ? (
                            <input
                                className="pd-input pd-input--title"
                                value={editForm?.fullName || ""}
                                onChange={(e) =>
                                    onFieldChange("fullName", e.target.value)
                                }
                            />
                        ) : (
                            patient?.fullName || "Patient Name"
                        )}
                    </h2>

                    <div className="folder-header-actions-row">
                        {isEditing ? (
                            <>
                                <button
                                    className="folder-save-btn"
                                    onClick={onSaveEdit}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                    className="folder-cancel-btn"
                                    onClick={onCancelEdit}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className="folder-edit-btn"
                                onClick={onStartEdit}
                            >
                                <EditIcon />
                                <span>Edit</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* GRID FIELDS */}
                <div className="pd-info__grid">
                    <InfoField
                        label="Email"
                        isEditing={isEditing}
                        type="text"
                        value={editForm?.email}
                        display={patient?.email}
                        onChange={(v) => onFieldChange("email", v)}
                    />
                    <InfoField
                        label="Phone"
                        isEditing={isEditing}
                        type="text"
                        value={editForm?.phone}
                        display={patient?.phone}
                        onChange={(v) => onFieldChange("phone", v)}
                    />
                    <InfoField
                        label="Birthday"
                        isEditing={isEditing}
                        type="date"
                        value={editForm?.birthday || ""}
                        display={editForm?.birthday || patient?.birthday}
                        onChange={(v) => onFieldChange("birthday", v)}
                    />
                    <InfoField
                        label="Age"
                        isEditing={isEditing}
                        type="number"
                        value={editForm?.age}
                        display={editForm?.age || patient?.age}
                        onChange={() => {}}
                        locked
                    />

                    <InfoField
                        label="Address"
                        isEditing={isEditing}
                        type="text"
                        value={editForm?.address}
                        display={patient?.address}
                        onChange={(v) => onFieldChange("address", v)}
                    />

                    {/* Gender riêng vì dùng <select> */}
                    <div className="pd-field">
                        <span className="pd-label">Gender:</span>
                        {isEditing ? (
                            <select
                                className="pd-input"
                                value={editForm?.gender || ""}
                                onChange={(e) =>
                                    onFieldChange("gender", e.target.value)
                                }
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        ) : (
                            <span>
                                {patient?.gender
                                    ? patient.gender[0].toUpperCase() +
                                      patient.gender.slice(1)
                                    : "N/A"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <button className="symptom-add-btn" style={{ marginLeft: "auto" }}>
                <AddIcon color="white" />
                <span>Import</span>
            </button>
        </section>
    );
}
