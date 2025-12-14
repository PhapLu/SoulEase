import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiUtils } from "../../../../../utils/newRequest";
import "./TreatmentSection.css";

export default function CreateSessionPage() {
    const { patientRecordId } = useParams();
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    const [form, setForm] = useState({
        date: "",
        focus: "",
        phq9: "",
        gad7: "",
        severity: 5,
        risk: "Low",
        status: "Planned",
        note: "",
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setSaving(true);

        try {
            const res = await apiUtils.get(
                `/patientRecord/readPatientRecord/${patientRecordId}`
            );
            const record =
                res?.data?.metadata?.patientRecord ||
                res?.data?.patientRecord ||
                null;

            const prevSessions = Array.isArray(record?.treatmentSessions)
                ? record.treatmentSessions
                : [];

            const newSession = {
                id: `sess-${Date.now()}`,
                date: form.date,
                focus: form.focus,
                phq9: form.phq9 === "" ? null : Number(form.phq9),
                gad7: form.gad7 === "" ? null : Number(form.gad7),
                severity: Number(form.severity),
                risk: form.risk,
                status: form.status,
                note: form.note,
            };

            const nextSessions = [newSession, ...prevSessions].sort((a, b) =>
                (a.date || "") < (b.date || "") ? 1 : -1
            );

            const nextRecord = {
                ...record,
                treatmentSessions: nextSessions,
            };

            await apiUtils.put(
                `/patientRecord/updatePatientRecord/${patientRecordId}`,
                nextRecord
            );

            navigate(-1);
        } catch (e2) {
            setErr(e2?.message || "Create session failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tp-page">
            <div className="tp-header" style={{ marginBottom: 14 }}>
                <div>
                    <div className="tp-title" style={{ fontSize: 28 }}>
                        Create session
                    </div>
                    <div className="tp-subtitle">
                        PatientRecord: {patientRecordId}
                    </div>
                </div>

                <div className="tp-header__actions">
                    <button
                        className="tp-btn tp-btn--ghost"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                </div>
            </div>

            {err ? <div className="tp-error">{err}</div> : null}

            <section className="tp-card">
                <form className="tp-form" onSubmit={onSubmit}>
                    <div className="tp-form__grid">
                        <label className="tp-form__field">
                            <div className="tp-form__label">Date *</div>
                            <input
                                className="tp-input"
                                type="date"
                                required
                                value={form.date}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        date: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field">
                            <div className="tp-form__label">Status</div>
                            <select
                                className="tp-input"
                                value={form.status}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        status: e.target.value,
                                    }))
                                }
                            >
                                <option>Planned</option>
                                <option>Completed</option>
                                <option>Cancelled</option>
                            </select>
                        </label>

                        <label className="tp-form__field tp-form__field--span2">
                            <div className="tp-form__label">Focus *</div>
                            <input
                                className="tp-input"
                                required
                                value={form.focus}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        focus: e.target.value,
                                    }))
                                }
                                placeholder="e.g. Cognitive restructuring"
                            />
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
                            <div className="tp-form__label">
                                Severity (0–10)
                            </div>
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
                    </div>

                    <div className="tp-form__actions">
                        <button
                            type="button"
                            className="tp-btn tp-btn--ghost"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="tp-btn"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Create"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
