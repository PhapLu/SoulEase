// TreatmentSection.jsx
import EditIcon from "../../EditIcon";

export default function TreatmentSection({ onStartEdit }) {
    return (
        <section className="pd-treatment">
            <div className="pd-section-title">
                <h3>Treatment Process</h3>
                <button className="folder-edit-btn" onClick={onStartEdit}>
                    <EditIcon />
                    <span>Edit</span>
                </button>
            </div>
            <div className="pd-note-card">
                <p className="pd-note-placeholder">
                    Add treatment process for patient
                </p>
            </div>
        </section>
    );
}
