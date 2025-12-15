// CreateSessionPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUtils } from "../../../../../utils/newRequest";
import "./TreatmentSession.css";

export default function CreateSessionPage() {
    const { folderId, patientRecordId } = useParams();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const [symptomsOptions, setSymptomsOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [stageOptions, setStageOptions] = useState([
        "Stage 1: Stabilization & coping skills",
    ]);

    const [form, setForm] = useState({
        date: new Date().toISOString().split("T")[0],
        symptoms: [],
        phq9: "",
        gad7: "",
        severity: 5,
        risk: "Low",
        stage: "Stage 1: Stabilization & coping skills",
        note: "",
        result: "",
        treatment: "",
    });

    useEffect(() => {
        const fetchSymptoms = async () => {
            if (!patientRecordId) return;
            try {
                const res = await apiUtils.get(
                    `/patientRecord/readPatientRecord/${patientRecordId}`
                );
                const record =
                    res?.data?.metadata?.patientRecord ||
                    res?.data?.patientRecord ||
                    null;
                const stageStatus = record?.treatmentPlan?.stageStatus || {};
                const symptomList = Array.isArray(record?.symptoms)
                    ? record.symptoms
                          .map((s, idx) => ({
                              id: s.id || s._id || `sym-${idx}`,
                              name: s.name || "",
                              sign: s.sign || "",
                              date: s.date || "",
                              status: s.status || "",
                          }))
                          .filter((s) => s.name || s.sign)
                    : [];
                setSymptomsOptions(symptomList);

                // determine allowed stage
                const stage1Done = !!stageStatus.stage1;
                const stage2Done = !!stageStatus.stage2;
                let allowedStage = "Stage 1: Stabilization & coping skills";
                let allowedOptions = ["Stage 1: Stabilization & coping skills"];
                if (stage1Done && !stage2Done) {
                    allowedStage = "Stage 2: Trauma narrative & processing";
                    allowedOptions = ["Stage 2: Trauma narrative & processing"];
                } else if (stage1Done && stage2Done) {
                    allowedStage = "Stage 3: Maintenance & relapse prevention";
                    allowedOptions = ["Stage 3: Maintenance & relapse prevention"];
                }
                setStageOptions(allowedOptions);
                setForm((p) => ({ ...p, stage: allowedStage }));
            } catch (e) {
                // ignore, keep empty options
            }
        };

        fetchSymptoms();
    }, [patientRecordId]);

    const addSymptomFromOption = () => {
        if (!selectedOption) return;
        const opt = symptomsOptions.find((s) => s.id === selectedOption);
        if (!opt) return;
        setForm((p) => {
            const exists = p.symptoms.some((s) => s.id === opt.id);
            if (exists) return p;
            return {
                ...p,
                symptoms: [...p.symptoms, { ...opt }],
            };
        });
    };

    const addBlankSymptom = () => {
        setForm((p) => ({
            ...p,
            symptoms: [
                ...p.symptoms,
                {
                    id: `sym-${Date.now()}`,
                    name: "",
                    sign: "",
                    date: new Date().toISOString().split("T")[0],
                    status: "Active",
                },
            ],
        }));
    };

    const goBackToTreatment = () => {
        if (folderId && patientRecordId) {
            navigate(
                `/workspace/patients/folder/${folderId}/${patientRecordId}/treatment`
            );
        } else {
            navigate(-1);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        if (!patientRecordId) {
            setErr("Missing patient record id");
            return;
        }
        if (!form.date) {
            setErr("Missing session date");
            return;
        }
        setSaving(true);

        try {
            const res = await apiUtils.get(
                `/patientRecord/readPatientRecord/${patientRecordId}`
            );

            const record =
                res?.data?.metadata?.patientRecord ||
                res?.data?.patientRecord ||
                null;

            if (!record) throw new Error("Patient record not found");

            const recordId = record.recordId || record._id;
            if (!recordId) throw new Error("Missing recordId to update record");

            const prevSessions = Array.isArray(record?.treatmentSessions)
                ? record.treatmentSessions
                : Array.isArray(record?.treatmentSections)
                ? record.treatmentSections
                : [];

            const selectedSymptoms = (form.symptoms || []).map((s) => ({
                id: s.id || `sym-${Date.now()}`,
                name: (s.name || "").trim(),
                sign: (s.sign || "").trim(),
                date: s.date || "",
                status: s.status || "",
            }));
            const focusText = selectedSymptoms
                .map((s) => s.name || s.sign)
                .filter(Boolean)
                .join(", ");

            const sanitizedStage = stageOptions.includes(form.stage)
                ? form.stage
                : stageOptions[0];

            const resultText = (form.result || "").trim() || focusText;

            const newSession = {
                id: `sess-${Date.now()}`,
                date: form.date,
                focus: resultText || focusText,
                symptoms: selectedSymptoms,
                phq9: form.phq9 === "" ? null : Number(form.phq9),
                gad7: form.gad7 === "" ? null : Number(form.gad7),
                severity: Number(form.severity),
                risk: form.risk,
                stage: sanitizedStage,
                status: sanitizedStage,
                note: form.note,
                result: resultText,
                treatment: form.treatment,
            };

            const nextSessions = [newSession, ...prevSessions].sort((a, b) =>
                (b.date || "").localeCompare(a.date || "")
            );

            await apiUtils.patch(
                `/patientRecord/updatePatientRecord/${recordId}`,
                {
                    treatmentSessions: nextSessions,
                    treatmentSections: nextSessions,
                }
            );

            goBackToTreatment();
        } catch (e2) {
            setErr(
                e2?.response?.data?.message ||
                    e2?.message ||
                    "Create session failed"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="tp-page"
            style={{ marginTop: 18, padding: 0, maxWidth: "unset" }}
        >
            <div className="tp-header" style={{ marginBottom: 14 }}>
                <div className="pd-treatment">
                    <h3>Create Session</h3>
                </div>
            </div>

            {err ? <div className="tp-error">{err}</div> : null}

            <section className="tp-card">
                <form className="tp-form" onSubmit={onSubmit}>
                    <div className="tp-form__grid">
                        <label className="tp-form__field">
                            <div className="tp-form__label">Date</div>
                            <input
                                className="tp-input"
                                type="date"
                                value={form.date}
                                disabled
                                readOnly
                            />
                        </label>

                        <label className="tp-form__field">
                            <div className="tp-form__label">Stage</div>
                            <select
                                className="tp-input"
                                value={form.stage}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (!stageOptions.includes(val)) return;
                                    setForm((p) => ({ ...p, stage: val }));
                                }}
                            >
                                {stageOptions.map((opt) => (
                                    <option key={opt}>{opt}</option>
                                ))}
                            </select>
                        </label>

                        <label className="tp-form__field tp-form__field--span2">
                            <div className="tp-form__label">Symptoms</div>
                            <div className="tp-list__tools" style={{ padding: 0 }}>
                                <div style={{ display: "grid", gap: 10 }}>
                                    {form.symptoms?.length ? (
                                        form.symptoms.map((sym, idx) => (
                                            <div
                                                key={sym.id || idx}
                                                className="tp-card"
                                                style={{
                                                    padding: 12,
                                                    boxShadow: "none",
                                                    borderColor: "var(--border)",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gap: 10,
                                                        gridTemplateColumns:
                                                            "repeat(auto-fit, minmax(200px, 1fr))",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <label className="tp-form__field">
                                                        <div className="tp-form__label">
                                                            Name
                                                        </div>
                                                        <input
                                                            className="tp-input"
                                                            value={sym.name}
                                                            onChange={(e) =>
                                                                setForm((p) => {
                                                                    const next = [...p.symptoms];
                                                                    next[idx] = {
                                                                        ...next[idx],
                                                                        name: e.target.value,
                                                                    };
                                                                    return { ...p, symptoms: next };
                                                                })
                                                            }
                                                        />
                                                    </label>
                                                    <label className="tp-form__field">
                                                        <div className="tp-form__label">
                                                            Sign
                                                        </div>
                                                        <input
                                                            className="tp-input"
                                                            value={sym.sign}
                                                            onChange={(e) =>
                                                                setForm((p) => {
                                                                    const next = [...p.symptoms];
                                                                    next[idx] = {
                                                                        ...next[idx],
                                                                        sign: e.target.value,
                                                                    };
                                                                    return { ...p, symptoms: next };
                                                                })
                                                            }
                                                        />
                                                    </label>
                                                    <label className="tp-form__field">
                                                        <div className="tp-form__label">
                                                            Date
                                                        </div>
                                                        <input
                                                            className="tp-input"
                                                            type="date"
                                                            value={sym.date}
                                                            onChange={(e) =>
                                                                setForm((p) => {
                                                                    const next = [...p.symptoms];
                                                                    next[idx] = {
                                                                        ...next[idx],
                                                                        date: e.target.value,
                                                                    };
                                                                    return { ...p, symptoms: next };
                                                                })
                                                            }
                                                        />
                                                    </label>
                                                    <label className="tp-form__field">
                                                        <div className="tp-form__label">
                                                            Status
                                                        </div>
                                                        <select
                                                            className="tp-input"
                                                            value={sym.status}
                                                            onChange={(e) =>
                                                                setForm((p) => {
                                                                    const next = [...p.symptoms];
                                                                    next[idx] = {
                                                                        ...next[idx],
                                                                        status: e.target.value,
                                                                    };
                                                                    return { ...p, symptoms: next };
                                                                })
                                                            }
                                                        >
                                                            <option>Active</option>
                                                            <option>Resolved</option>
                                                            <option>Pending</option>
                                                        </select>
                                                    </label>
                                                    <div
                                                        className="tp-actions"
                                                        style={{ justifyContent: "flex-start" }}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="tp-btn-icon tp-btn-icon--danger"
                                                            onClick={() =>
                                                                setForm((p) => ({
                                                                    ...p,
                                                                    symptoms: p.symptoms.filter(
                                                                        (_s, i) => i !== idx
                                                                    ),
                                                                }))
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="tp-muted">
                                            No symptoms selected.
                                        </span>
                                    )}
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gap: 8,
                                        marginTop: 14,
                                    }}
                                >
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <select
                                            className="tp-input"
                                            value={selectedOption}
                                            onChange={(e) => setSelectedOption(e.target.value)}
                                            style={{ maxWidth: 320 }}
                                        >
                                            <option value="">Add from existing symptoms</option>
                                            {symptomsOptions.map((sym) => (
                                                <option key={sym.id} value={sym.id}>
                                                    {sym.name || sym.sign || sym.id}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="tp-btn tp-btn--ghost"
                                            onClick={addSymptomFromOption}
                                        >
                                            Add selected
                                        </button>
                                        <button
                                            type="button"
                                            className="tp-btn"
                                            onClick={addBlankSymptom}
                                        >
                                            Add new symptom
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </label>

                        <label className="tp-form__field">
                            <div className="tp-form__label">PHQ-9</div>
                            <input
                                className="tp-input"
                                type="number"
                                min="0"
                                max="27"
                                value={form.phq9}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        phq9: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field">
                            <div className="tp-form__label">GAD-7</div>
                            <input
                                className="tp-input"
                                type="number"
                                min="0"
                                max="21"
                                value={form.gad7}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        gad7: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field">
                            <div className="tp-form__label">Severity (0–10)</div>
                            <input
                                className="tp-input"
                                type="number"
                                min="0"
                                max="10"
                                value={form.severity}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        severity: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field">
                            <div className="tp-form__label">Risk</div>
                            <select
                                className="tp-input"
                                value={form.risk}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        risk: e.target.value,
                                    }))
                                }
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </label>

                        <label className="tp-form__field tp-form__field--span2">
                            <div className="tp-form__label">Notes</div>
                            <textarea
                                className="tp-input tp-textarea"
                                rows={6}
                                value={form.note}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        note: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field tp-form__field--span2">
                            <div className="tp-form__label">Result</div>
                            <textarea
                                className="tp-input tp-textarea"
                                rows={4}
                                value={form.result}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        result: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field tp-form__field--span2">
                            <div className="tp-form__label">Treatment</div>
                            <textarea
                                className="tp-input tp-textarea"
                                rows={4}
                                value={form.treatment}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        treatment: e.target.value,
                                    }))
                                }
                            />
                        </label>
                    </div>

                    <div className="tp-form__actions">
                        <button
                            type="button"
                            className="tp-btn tp-btn--ghost"
                            onClick={goBackToTreatment}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="tp-btn" disabled={saving}>
                            {saving ? "Saving..." : "Create"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
