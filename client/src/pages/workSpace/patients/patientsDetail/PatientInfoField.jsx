// PatientInfoField.jsx
export default function InfoField({
    label,
    isEditing,
    type = "text",
    value,
    display,
    onChange,
    locked = false,
}) {
    return (
        <div className="pd-field">
            <span className="pd-label">{label}:</span>
            {isEditing ? (
                <input
                    className={`pd-input ${locked ? "pd-input--locked" : ""}`}
                    type={type}
                    value={value || ""}
                    disabled={locked}
                    readOnly={locked}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <span>{display || "N/A"}</span>
            )}
        </div>
    );
}
