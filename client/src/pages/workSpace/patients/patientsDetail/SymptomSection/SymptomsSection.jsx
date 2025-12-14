import { EditIcon, RemoveIcon, AddIcon } from "../../../Icons";
import "./SymptomsSection.css";

export default function SymptomsSection({
    symptoms,
    editingSymptoms,
    setEditingSymptoms,
    onSaveSymptoms,
    onCancelSymptoms,
    onAddSymptom,
    onSymptomFieldChange,
    onSymptomKeyDown,
    onRemoveSymptom,
}) {
    return (
        <section className="pd-symptoms">
            <div className="pd-section-title">
                <h3>Symptoms</h3>

                {editingSymptoms ? (
                    <div className="pd-symptom-actions">
                        <button
                            className="folder-save-btn"
                            onClick={onSaveSymptoms}
                        >
                            Save
                        </button>
                        <button
                            className="folder-cancel-btn"
                            onClick={onCancelSymptoms}
                        >
                            Cancel
                        </button>
                    </div>
                ) : null}
            </div>

            <div className="pd-note-card">
                {/* TABLE HEADER */}
                <div className="pd-symptom-row pd-symptom-header">
                    <div className="pd-symptom-col-title">Name</div>
                    <div className="pd-symptom-col-title">Sign</div>
                    <div style={{ width: 70 }}></div>
                </div>

                {symptoms.map((s, idx) => (
                    <div className="pd-symptom-row" key={s.id || idx}>
                        {editingSymptoms ? (
                            <>
                                <input
                                    className="pd-input pd-input--symptom"
                                    value={s.name}
                                    placeholder="Name"
                                    onChange={(e) =>
                                        onSymptomFieldChange(
                                            idx,
                                            "name",
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => onSymptomKeyDown(e, idx)}
                                />

                                <input
                                    className="pd-input pd-input--symptom"
                                    value={s.sign}
                                    placeholder="Sign"
                                    onChange={(e) =>
                                        onSymptomFieldChange(
                                            idx,
                                            "sign",
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => onSymptomKeyDown(e, idx)}
                                />

                                <button
                                    className="symptom-remove-btn"
                                    onClick={() => onRemoveSymptom(idx)}
                                >
                                    <RemoveIcon />
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="pd-symptom-text">{s.name}</div>
                                <div className="pd-symptom-text">{s.sign}</div>
                                <div></div>
                            </>
                        )}
                    </div>
                ))}

                {/* ADD BUTTON  */}
                {!editingSymptoms ? (
                    <div className="symptom-add-container">
                        <button
                            className="symptom-add-btn"
                            onClick={() => {
                                onAddSymptom();
                                setEditingSymptoms(true);
                            }}
                        >
                            <AddIcon color="white" />
                            <span>Add</span>
                        </button>
                    </div>
                ) : (
                    <div className="symptom-add-container">
                        <button
                            className="symptom-add-btn"
                            onClick={onAddSymptom}
                        >
                            <AddIcon color="white" />
                            <span>Add</span>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
