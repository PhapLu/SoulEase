// SymptomsSection.jsx
export default function SymptomsSection({
    symptoms,
    editingSymptoms,
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
                                    Remove
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

                {/* ADD BUTTON — giống code gốc */}
                <div className="symptom-add-container">
                    <button className="symptom-add-btn" onClick={onAddSymptom}>
                        Add +
                    </button>
                </div>
            </div>
        </section>
    );
}
