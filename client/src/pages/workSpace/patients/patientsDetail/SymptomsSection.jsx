// SymptomsSection.jsx
import { useMemo } from "react";

export default function SymptomsSection({
    symptoms,
    editingSymptoms,
    setEditingSymptoms,
    readOnly,
    onSaveSymptoms,
    onCancelSymptoms,
    onAddSymptom,
    onSymptomFieldChange,
    onSymptomKeyDown,
    onRemoveSymptom,
    onToggleSymptomStatus,
    onTogglePresetSymptom,
}) {
    const presetSymptoms = useMemo(
        () => [
            { id: "builtin-1", name: "Headache", sign: "Persistent head pain" },
            { id: "builtin-2", name: "Fatigue", sign: "Constant tiredness" },
            { id: "builtin-3", name: "Insomnia", sign: "Difficulty sleeping" },
            { id: "builtin-4", name: "Anxiety", sign: "Excessive worry or nervousness" },
            { id: "builtin-5", name: "Depressed Mood", sign: "Prolonged sadness" },
            { id: "builtin-6", name: "Loss of Appetite", sign: "Reduced desire to eat" },
            { id: "builtin-7", name: "Difficulty Concentrating", sign: "Trouble focusing" },
            { id: "builtin-8", name: "Irritability", sign: "Easily frustrated or angered" },
            { id: "builtin-9", name: "Restlessness", sign: "Inability to relax or stay still" },
            { id: "builtin-10", name: "Low Motivation", sign: "Lack of interest in daily activities" },
        ],
        []
    );
    const presetByName = useMemo(() => {
        const map = {};
        presetSymptoms.forEach((p) => {
            map[p.name.toLowerCase()] = p;
        });
        return map;
    }, [presetSymptoms]);

    const isChecked = (preset) =>
        symptoms.some(
            (s) =>
                (s.name || "").trim().toLowerCase() ===
                    (preset.name || "").toLowerCase() &&
                (s.sign || "").trim().toLowerCase() ===
                    (preset.sign || "").toLowerCase()
        );

    const handleSelectPreset = (value) => {
        if (!value) return
        if (value === "__other") {
            onAddSymptom()
            setEditingSymptoms(true)
            return
        }
        const preset = presetSymptoms.find((p) => p.id === value)
        if (!preset) return
        if (!isChecked(preset)) {
            onTogglePresetSymptom?.(preset, true)
        }
    };

    return (
        <section className="pd-symptoms">
            <div className="pd-section-title">
                <h3>Symptoms</h3>

                {editingSymptoms && !readOnly ? (
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
                <div className="pd-symptom-row pd-symptom-header pd-symptom-row--grid">
                    <div className="pd-symptom-col-title">Name</div>
                    <div className="pd-symptom-col-title">Sign</div>
                    <div className="pd-symptom-col-title">Date</div>
                    <div className="pd-symptom-col-title">Status</div>
                    <div style={{ width: 70 }}></div>
                </div>

                {symptoms.map((s, idx) => (
                    <div
                        className="pd-symptom-row pd-symptom-row--grid"
                        key={s.id || idx}
                    >
                        {editingSymptoms && !readOnly ? (
                            <>
                                {(() => {
                                    const match =
                                        presetByName[(s.name || "").toLowerCase()] ||
                                        null;
                                    const selectValue = match
                                        ? match.id
                                        : s.isCustom ? "__other" : "";
                                    const isOther = selectValue === "__other";
                                    return (
                                        <>
                                            <select
                                                className="pd-input pd-input--symptom"
                                                value={selectValue}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "__other") {
                                                        onSymptomFieldChange(idx, "isCustom", true);
                                                        onSymptomFieldChange(idx, "name", "");
                                                        onSymptomFieldChange(idx, "sign", "");
                                                        return;
                                                    }
                                                    if (!val) {
                                                        onSymptomFieldChange(idx, "isCustom", false);
                                                        onSymptomFieldChange(idx, "name", "");
                                                        onSymptomFieldChange(idx, "sign", "");
                                                        return;
                                                    }
                                                    const preset = presetSymptoms.find((p) => p.id === val);
                                                    if (preset) {
                                                        onSymptomFieldChange(idx, "isCustom", false);
                                                        onSymptomFieldChange(idx, "name", preset.name);
                                                        onSymptomFieldChange(idx, "sign", preset.sign);
                                                    }
                                                }}
                                            >
                                                <option value="">Select symptom</option>
                                                {presetSymptoms.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                                <option value="__other">Other</option>
                                            </select>

                                            {isOther ? (
                                                <input
                                                    className="pd-input pd-input--symptom"
                                                    value={s.name}
                                                    placeholder="Name"
                                                    onChange={(e) =>
                                                        onSymptomFieldChange(idx, "name", e.target.value)
                                                    }
                                                    onKeyDown={(e) => onSymptomKeyDown(e, idx)}
                                                />
                                            ) : null}

                                            <input
                                                className="pd-input pd-input--symptom"
                                                value={isOther ? s.sign : match?.sign || s.sign}
                                                placeholder="Sign"
                                                onChange={(e) =>
                                                    onSymptomFieldChange(idx, "sign", e.target.value)
                                                }
                                                onKeyDown={(e) => onSymptomKeyDown(e, idx)}
                                                readOnly={!isOther}
                                            />
                                        </>
                                    );
                                })()}

                                <div className="pd-symptom-date">
                                    {s.date || "—"}
                                </div>

                                <button
                                    className={`pd-symptom-status ${
                                        s.status === "Resolved"
                                            ? "pd-symptom-status--resolved"
                                            : "pd-symptom-status--active"
                                    }`}
                                    type="button"
                                    onClick={() => onToggleSymptomStatus(idx)}
                                >
                                    <span className="pd-status-dot" />
                                    {s.status === "Resolved"
                                        ? "Resolved"
                                        : "Active"}
                                </button>

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
                                <div className="pd-symptom-text">
                                    {s.date || "—"}
                                </div>
                                <button
                                    className={`pd-symptom-status pd-symptom-status--view ${
                                        s.status === "Resolved"
                                            ? "pd-symptom-status--resolved"
                                            : "pd-symptom-status--active"
                                    }`}
                                    type="button"
                                    onClick={
                                        readOnly
                                            ? undefined
                                            : () => onToggleSymptomStatus(idx)
                                    }
                                    disabled={readOnly}
                                >
                                    <span className="pd-status-dot" />
                                    {s.status === "Resolved"
                                        ? "Resolved"
                                        : "Active"}
                                </button>
                                <div></div>
                            </>
                        )}
                    </div>
                ))}

                {/* ADD BUTTON */}
                {!readOnly && (
                    <div className="symptom-add-container">
                        <button
                            className="symptom-add-btn"
                            type="button"
                            onClick={() => handleSelectPreset("__other")}
                        >
                            Add +
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
