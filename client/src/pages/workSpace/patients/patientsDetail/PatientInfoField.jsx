// PatientInfoField.jsx
export default function InfoField({
    label,
    isEditing,
    type = "text",
    value,
    display,
    onChange,
}) {
    return (
        <div className="pd-field">
            <span className="pd-label">{label}:</span>
            {isEditing ? (
                <input
                    className="pd-input"
                    type={type}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <span>{display || "N/A"}</span>
            )}
        </div>
    );
}
