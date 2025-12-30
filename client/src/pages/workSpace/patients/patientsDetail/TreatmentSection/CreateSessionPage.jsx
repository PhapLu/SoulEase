// CreateSessionPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUtils } from "../../../../../utils/newRequest";
import "./TreatmentSession.css";
import { useAuth } from "../../../../../contexts/auth/AuthContext";

export default function CreateSessionPage() {
    const { folderId, patientRecordId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const isReadOnly = userInfo?.role === "family" || userInfo?.role === "member";
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const builtInSymptoms = useMemo(
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
            { id: "custom-other", name: "Other", sign: "", isCustom: true },
        ],
        []
    );
    const [symptomsOptions, setSymptomsOptions] = useState(builtInSymptoms);
    const [existingSymptoms, setExistingSymptoms] = useState([]);
    const presetById = useMemo(() => {
        const map = {};
        symptomsOptions.forEach((p) => {
            map[p.id] = p;
        });
        return map;
    }, [symptomsOptions]);
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
        if (!isReadOnly) return;
        if (folderId && patientRecordId) {
            navigate(
                `/workspace/patients/folder/${folderId}/${patientRecordId}/treatment`,
                { replace: true }
            );
        } else {
            navigate("/workspace", { replace: true });
        }
    }, [isReadOnly, folderId, patientRecordId, navigate]);

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
                setExistingSymptoms(symptomList);
                const merged = [...builtInSymptoms];
                symptomList.forEach((s) => {
                    const exists = merged.some(
                        (m) =>
                            m.name?.toLowerCase() === (s.name || "").toLowerCase() &&
                            m.sign?.toLowerCase() === (s.sign || "").toLowerCase()
                    );
                    if (!exists) merged.push(s);
                });
                setSymptomsOptions(merged);

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
    }, [patientRecordId, builtInSymptoms]);

    const handleToggleSymptom = (optId, checked) => {
        const opt = symptomsOptions.find((s) => s.id === optId);
        if (!opt) return;
        setForm((p) => {
            const exists = p.symptoms.some((s) => s.id === optId);
            if (checked && !exists) {
                const today = new Date().toISOString().split("T")[0];
                const toAdd = {
                    ...opt,
                    date: opt.date || today,
                    status: opt.status || "Active",
                    isCustom: opt.isCustom || opt.id === "custom-other",
                };
                return { ...p, symptoms: [...p.symptoms, toAdd] };
            }
            if (!checked) {
                return {
                    ...p,
                    symptoms: p.symptoms.filter((s) => s.id !== optId),
                };
            }
            return p;
        });
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
        if (isReadOnly) return;
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

            const selectedSymptoms = (form.symptoms || []).map((s, idx) => ({
                id: s.id || `sym-${Date.now()}-${idx}`,
                name: (s.name || "").trim(),
                sign: (s.sign || "").trim(),
                date: s.date || "",
                status: s.status || "",
                isCustom: !!s.isCustom,
            }));
            const focusText = selectedSymptoms
                .map((s) => s.name || s.sign)
                .filter(Boolean)
                .join(", ");

            // merge symptoms into patient record
            const today = new Date().toISOString().split("T")[0];
            const mergedSymptoms = [...existingSymptoms];
            selectedSymptoms.forEach((s, idx) => {
                const existsIdx = mergedSymptoms.findIndex(
                    (m) =>
                        (m.name || "").toLowerCase() === (s.name || "").toLowerCase() &&
                        (m.sign || "").toLowerCase() === (s.sign || "").toLowerCase()
                );
                if (existsIdx === -1) {
                    mergedSymptoms.push({
                        id: s.id || `sym-${Date.now()}-${idx}`,
                        name: s.name || s.sign || "Symptom",
                        sign: s.sign,
                        date: s.date || today,
                        status: s.status || "Active",
                    });
                }
            });

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
                    symptoms: mergedSymptoms,
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
        >
            <div className="tp-header">
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
                                        form.symptoms.map((sym, idx) => {
                                            const match = sym.name
                                                ? symptomsOptions.find(
                                                      (opt) =>
                                                          opt.name?.toLowerCase() === sym.name.toLowerCase()
                                                  )
                                                : null;
                                            const selectValue = match ? match.id : "custom-other";
                                            const isCustom = sym.isCustom || selectValue === "custom-other";
                                            return (
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
                                                            <select
                                                                className="tp-input"
                                                                value={selectValue}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === "custom-other") {
                                                                        setForm((p) => {
                                                                            const next = [...p.symptoms];
                                                                            next[idx] = {
                                                                                ...next[idx],
                                                                                name: "",
                                                                                sign: "",
                                                                                isCustom: true,
                                                                            };
                                                                            return { ...p, symptoms: next };
                                                                        });
                                                                        return;
                                                                    }
                                                                    const preset = presetById[val];
                                                                    if (preset) {
                                                                        setForm((p) => {
                                                                            const next = [...p.symptoms];
                                                                            next[idx] = {
                                                                                ...next[idx],
                                                                                name: preset.name,
                                                                                sign: preset.sign,
                                                                                isCustom: false,
                                                                            };
                                                                            return { ...p, symptoms: next };
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                {symptomsOptions.map((opt) => (
                                                                    <option key={opt.id} value={opt.id}>
                                                                        {opt.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </label>
                                                        <label className="tp-form__field">
                                                            <div className="tp-form__label">
                                                                Sign
                                                            </div>
                                                            <input
                                                                className="tp-input"
                                                                value={isCustom ? sym.sign : match?.sign || sym.sign}
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
                                                                readOnly={!isCustom}
                                                                placeholder="Sign"
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
                                                                        symptoms: p.symptoms.filter((_s, i) => i !== idx),
                                                                    }))
                                                                }
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <span className="tp-muted">
                                            No symptoms selected.
                                        </span>
                                    )}
                                </div>

                                <div className="symptom-add-container" style={{ marginTop: 8 }}>
                                    <button
                                        type="button"
                                        className="tp-btn tp-btn--ghost"
                                        onClick={() =>
                                            setForm((p) => ({
                                                ...p,
                                                symptoms: [
                                                    ...p.symptoms,
                                                    {
                                                        id: `sym-${Date.now()}`,
                                                        name: "Headache",
                                                        sign: "Persistent head pain",
                                                        date: new Date().toISOString().split("T")[0],
                                                        status: "Active",
                                                        isCustom: false,
                                                    },
                                                ],
                                            }))
                                        }
                                    >
                                        Add symptom
                                    </button>
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
