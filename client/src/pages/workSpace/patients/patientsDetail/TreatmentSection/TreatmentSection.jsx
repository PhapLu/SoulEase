// TreatmentSection.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./treatmentSection.css";
import { EditIcon, RemoveIcon, AddIcon } from "../../../Icons";

function RiskBadge({ level = "Low" }) {
    const norm = (level || "Low").toLowerCase();
    const cls = norm.includes("high")
        ? "high"
        : norm.includes("medium")
        ? "medium"
        : "low";
    return <span className={`tp-risk tp-risk--${cls}`}>{level}</span>;
}

function SeverityPill({ value = 0 }) {
    const v = Math.max(0, Math.min(10, Number(value) || 0));
    return (
        <div className="tp-severity">
            <div className="tp-severity__label">Overall severity</div>
            <div
                className="tp-severity__bar"
                aria-label={`Severity ${v} out of 10`}
            >
                <div
                    className="tp-severity__fill"
                    style={{ width: `${(v / 10) * 100}%` }}
                />
            </div>
            <div className="tp-severity__value">{v}/10</div>
        </div>
    );
}

function Modal({ open, title, onClose, children }) {
    if (!open) return null;
    return (
        <div className="tp-modal__backdrop" role="dialog" aria-modal="true">
            <div className="tp-modal">
                <div className="tp-modal__header">
                    <div className="tp-modal__title">{title}</div>
                    <button
                        className="tp-icon-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                <div className="tp-modal__body">{children}</div>
            </div>
        </div>
    );
}

export default function TreatmentSection({
    patientRecordId,
    loading,
    error,
    plan,
    sections,
    latest,
    onUpdatePlan,
    onUpdateLatest,
    onCreateSection,
    onRefetch,
}) {
    const navigate = useNavigate();
    const { folderId, patientRecordId: prIdFromUrl } = useParams();

    const prId = patientRecordId || prIdFromUrl;

    const goCreateSectionPage = () => {
        if (!folderId || !prId) return;
        navigate(`/workspace/patients/folder/${folderId}/${prId}/section/new`);
    };

    // ---- UI state
    const [query, setQuery] = useState("");
    const [expandedStage3, setExpandedStage3] = useState(false);

    // ---- Modals
    const [openPlanModal, setOpenPlanModal] = useState(false);
    const [openLatestModal, setOpenLatestModal] = useState(false);
    const [openQuickUpdate, setOpenQuickUpdate] = useState(false);

    const [savingPlan, setSavingPlan] = useState(false);
    const [savingLatest, setSavingLatest] = useState(false);
    const [savingQuick, setSavingQuick] = useState(false);

    // ---- Drafts
    const [planDraft, setPlanDraft] = useState({
        title: "",
        goals: "",
        startDate: "",
        frequency: "",
    });

    useEffect(() => {
        if (!openPlanModal) return;
        setPlanDraft({
            title: plan?.title || "",
            goals: plan?.goals || "",
            startDate: plan?.startDate || "",
            frequency: plan?.frequency || "",
        });
    }, [openPlanModal, plan]);

    const [latestDraft, setLatestDraft] = useState({
        focus: "",
        phq9: "",
        gad7: "",
        severity: 5,
        risk: "Low",
        note: "",
        status: "Planned",
    });

    useEffect(() => {
        if (!openLatestModal) return;
        setLatestDraft({
            focus: latest?.focus || "",
            phq9: latest?.phq9 ?? "",
            gad7: latest?.gad7 ?? "",
            severity: latest?.severity ?? 5,
            risk: latest?.risk || "Low",
            note: latest?.note || "",
            status: latest?.status || "Planned",
        });
    }, [openLatestModal, latest]);

    const [quickDraft, setQuickDraft] = useState({ noteAppend: "" });
    useEffect(() => {
        if (!openQuickUpdate) return;
        setQuickDraft({ noteAppend: "" });
    }, [openQuickUpdate]);

    // ---- Derived
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sections || [];
        return (sections || []).filter((s) => {
            const hay =
                `${s.date} ${s.focus} ${s.note} ${s.status} ${s.risk}`.toLowerCase();
            return hay.includes(q);
        });
    }, [sections, query]);

    // ---- Actions
    const handleSavePlan = async (e) => {
        e.preventDefault();
        if (!onUpdatePlan) return;
        setSavingPlan(true);
        try {
            await onUpdatePlan(planDraft);
            setOpenPlanModal(false);
            onRefetch?.();
        } finally {
            setSavingPlan(false);
        }
    };

    const handleSaveLatest = async (e) => {
        e.preventDefault();
        if (!onUpdateLatest || !latest?.id) return;
        setSavingLatest(true);
        try {
            await onUpdateLatest(latest.id, {
                focus: latestDraft.focus,
                phq9: latestDraft.phq9 === "" ? null : Number(latestDraft.phq9),
                gad7: latestDraft.gad7 === "" ? null : Number(latestDraft.gad7),
                severity: Number(latestDraft.severity),
                risk: latestDraft.risk,
                note: latestDraft.note,
                status: latestDraft.status,
            });
            setOpenLatestModal(false);
            onRefetch?.();
        } finally {
            setSavingLatest(false);
        }
    };

    const handleQuickUpdate = async (e) => {
        e.preventDefault();
        if (!onUpdateLatest || !latest?.id) return;

        const append = (quickDraft.noteAppend || "").trim();
        if (!append) return;

        setSavingQuick(true);
        try {
            const mergedNote =
                (latest?.note || "") + (latest?.note ? "\n" : "") + append;

            await onUpdateLatest(latest.id, {
                note: mergedNote,
            });

            setOpenQuickUpdate(false);
            onRefetch?.();
        } finally {
            setSavingQuick(false);
        }
    };

    const handleDeleteLatest = async () => {
        alert(
            "There is no DELETE section endpoint yet. Add handler delete and connect it here."
        );
    };

    return (
        <div
            className="tp-page"
            style={{ marginTop: 18, padding: 0, maxWidth: "unset" }}
        >
            {/* Header */}
            <div className="tp-header" style={{ marginBottom: 14 }}>
                <div>
                    <div className="pd-treatment">
                        <h3>Treatment Progress</h3>
                    </div>
                </div>

                <div className="tp-header__actions">
                    <button
                        className="tp-btn-icon tp-btn-icon--ghost"
                        onClick={() => setOpenPlanModal(true)}
                    >
                        <EditIcon size={16} />
                        Edit plan
                    </button>

                    <button
                        className="tp-btn-icon tp-btn-icon--primary"
                        onClick={goCreateSectionPage}
                    >
                        <AddIcon size={16} color="#fff" />
                        Create section
                    </button>
                </div>
            </div>

            {error ? <div className="tp-error">{error}</div> : null}
            {loading ? (
                <div className="tp-empty">Loading...</div>
            ) : (
                <>
                    <div className="tp-grid">
                        {/* STAGE 2 */}
                        <section className="tp-card">
                            <div className="tp-card__top">
                                <div>
                                    <div className="tp-card__kicker">
                                        STAGE 2
                                    </div>
                                    <div className="tp-card__title">
                                        Treatment process
                                    </div>
                                </div>
                                <span className="tp-chip">Plan</span>
                            </div>

                            <div className="tp-plan">
                                <div className="tp-field">
                                    <div className="tp-field__label">TITLE</div>
                                    <div className="tp-field__value">
                                        {plan?.title || "—"}
                                    </div>
                                </div>

                                <div className="tp-field">
                                    <div className="tp-field__label">GOALS</div>
                                    <div className="tp-field__value tp-muted">
                                        {plan?.goals || "—"}
                                    </div>
                                </div>

                                <div className="tp-plan__row">
                                    <div className="tp-mini">
                                        <div className="tp-mini__label">
                                            Start
                                        </div>
                                        <div className="tp-mini__value">
                                            {plan?.startDate || "—"}
                                        </div>
                                    </div>
                                    <div className="tp-mini">
                                        <div className="tp-mini__label">
                                            Frequency
                                        </div>
                                        <div className="tp-mini__value">
                                            {plan?.frequency || "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* STAGE 3 LATEST */}
                        <section className="tp-card">
                            <div className="tp-card__top">
                                <div>
                                    <div className="tp-card__kicker">
                                        STAGE 3
                                    </div>
                                    <div className="tp-card__title">
                                        Latest section
                                    </div>
                                </div>
                                <span className="tp-chip">Update</span>
                            </div>

                            {!latest ? (
                                <div className="tp-empty">
                                    No latest section.
                                </div>
                            ) : (
                                <>
                                    {/* click latest block => show full stage 3 */}
                                    <button
                                        className="tp-latest-click"
                                        onClick={() =>
                                            setExpandedStage3((v) => !v)
                                        }
                                        title="Click to toggle full stage"
                                    >
                                        <div className="tp-latest__row">
                                            <div className="tp-latest__meta">
                                                <div className="tp-latest__date">
                                                    {latest.date || "—"}
                                                </div>
                                                <div className="tp-latest__focus">
                                                    {latest.focus || "—"}
                                                </div>
                                            </div>
                                            <RiskBadge
                                                level={latest.risk || "Low"}
                                            />
                                        </div>

                                        <div className="tp-metrics">
                                            <div className="tp-metric">
                                                <div className="tp-metric__label">
                                                    PHQ-9
                                                </div>
                                                <div className="tp-metric__value">
                                                    {latest.phq9 ?? "—"}
                                                </div>
                                            </div>
                                            <div className="tp-metric">
                                                <div className="tp-metric__label">
                                                    GAD-7
                                                </div>
                                                <div className="tp-metric__value">
                                                    {latest.gad7 ?? "—"}
                                                </div>
                                            </div>
                                            <div className="tp-metric">
                                                <div className="tp-metric__label">
                                                    Status
                                                </div>
                                                <div className="tp-metric__value">
                                                    {latest.status ?? "—"}
                                                </div>
                                            </div>
                                        </div>

                                        <SeverityPill
                                            value={latest.severity ?? 0}
                                        />
                                    </button>

                                    <div
                                        className="tp-notes"
                                        style={{ marginTop: 10 }}
                                    >
                                        <div className="tp-notes__label">
                                            Notes
                                        </div>
                                        <div className="tp-notes__text">
                                            {latest.note || (
                                                <span className="tp-muted">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="tp-actions">
                                        <button
                                            className="tp-btn-icon tp-btn-icon--ghost"
                                            onClick={() =>
                                                setOpenQuickUpdate(true)
                                            }
                                        >
                                            <EditIcon size={16} />
                                            Quick update
                                        </button>

                                        <button
                                            className="tp-btn-icon tp-btn-icon--danger"
                                            onClick={handleDeleteLatest}
                                        >
                                            <RemoveIcon size={18} />
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>

                    <section className="tp-card tp-card--full">
                        <div className="tp-card__top">
                            <div>
                                <div className="tp-card__kicker">STAGE 3</div>
                                <div className="tp-card__title">Sections</div>
                            </div>

                            <div className="tp-list__tools">
                                <input
                                    className="tp-input"
                                    placeholder="Search sections (date, focus, notes, status, risk)..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {!expandedStage3 ? (
                            <div className="tp-empty">
                                Click the <b>Latest section</b> card to view the
                                full stage.
                            </div>
                        ) : !filtered?.length ? (
                            <div className="tp-empty">No sections.</div>
                        ) : (
                            <div className="tp-table">
                                <div className="tp-row tp-row--head">
                                    <div>DATE</div>
                                    <div>FOCUS</div>
                                    <div>SCORES</div>
                                    <div>SEVERITY</div>
                                    <div>RISK</div>
                                    <div>STATUS</div>
                                    <div />
                                </div>

                                {filtered.map((s) => (
                                    <div
                                        className="tp-row"
                                        key={s.id || `${s.date}-${s.focus}`}
                                    >
                                        <div className="tp-td tp-td--mono">
                                            {s.date || "—"}
                                        </div>

                                        <div className="tp-td">
                                            <div className="tp-td__primary">
                                                {s.focus || "—"}
                                            </div>
                                            {s.note ? (
                                                <div className="tp-td__secondary">
                                                    {s.note}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="tp-td tp-td--mono">
                                            <span className="tp-score">
                                                PHQ {s.phq9 ?? "—"}
                                            </span>
                                            <span className="tp-score">
                                                GAD {s.gad7 ?? "—"}
                                            </span>
                                        </div>

                                        <div className="tp-td">
                                            <span className="tp-badge">
                                                {s.severity ?? 0}/10
                                            </span>
                                        </div>

                                        <div className="tp-td">
                                            <RiskBadge
                                                level={s.risk || "Low"}
                                            />
                                        </div>

                                        <div className="tp-td">
                                            {s.status || "—"}
                                        </div>

                                        <div className="tp-td tp-td--right"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* ---------------- MODALS ---------------- */}

            {/* Stage 2 Modal: Edit plan */}
            <Modal
                open={openPlanModal}
                title="Stage 2 · Edit treatment plan"
                onClose={() => setOpenPlanModal(false)}
            >
                <form className="tp-form" onSubmit={handleSavePlan}>
                    <div className="tp-form__grid">
                        <label className="tp-form__field tp-form__field--span2">
                            <div className="tp-form__label">Title</div>
                            <input
                                className="tp-input"
                                value={planDraft.title}
                                onChange={(e) =>
                                    setPlanDraft((p) => ({
                                        ...p,
                                        title: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field tp-form__field--span2">
                            <div className="tp-form__label">Goals</div>
                            <textarea
                                className="tp-input tp-textarea"
                                rows={4}
                                value={planDraft.goals}
                                onChange={(e) =>
                                    setPlanDraft((p) => ({
                                        ...p,
                                        goals: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field">
                            <div className="tp-form__label">Start date</div>
                            <input
                                className="tp-input"
                                type="date"
                                value={planDraft.startDate}
                                onChange={(e) =>
                                    setPlanDraft((p) => ({
                                        ...p,
                                        startDate: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tp-form__field">
                            <div className="tp-form__label">Frequency</div>
                            <input
                                className="tp-input"
                                value={planDraft.frequency}
                                onChange={(e) =>
                                    setPlanDraft((p) => ({
                                        ...p,
                                        frequency: e.target.value,
                                    }))
                                }
                                placeholder="e.g. 1 section/week"
                            />
                        </label>
                    </div>

                    <div className="tp-form__actions">
                        <button
                            type="button"
                            className="tp-btn tp-btn--ghost"
                            onClick={() => setOpenPlanModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="tp-btn"
                            disabled={savingPlan}
                        >
                            {savingPlan ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Stage 3 Modal: Edit latest section */}
            <Modal
                open={openLatestModal}
                title="Stage 3 · Edit latest section"
                onClose={() => setOpenLatestModal(false)}
            >
                {!latest ? (
                    <div className="tp-empty">No latest section.</div>
                ) : (
                    <form className="tp-form" onSubmit={handleSaveLatest}>
                        <div className="tp-form__grid">
                            <label className="tp-form__field tp-form__field--span2">
                                <div className="tp-form__label">Focus</div>
                                <input
                                    className="tp-input"
                                    value={latestDraft.focus}
                                    onChange={(e) =>
                                        setLatestDraft((d) => ({
                                            ...d,
                                            focus: e.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="tp-form__field">
                                <div className="tp-form__label">PHQ-9</div>
                                <input
                                    className="tp-input"
                                    type="number"
                                    min="0"
                                    max="27"
                                    value={latestDraft.phq9}
                                    onChange={(e) =>
                                        setLatestDraft((d) => ({
                                            ...d,
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
                                    value={latestDraft.gad7}
                                    onChange={(e) =>
                                        setLatestDraft((d) => ({
                                            ...d,
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
                                    value={latestDraft.severity}
                                    onChange={(e) =>
                                        setLatestDraft((d) => ({
                                            ...d,
                                            severity: e.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className="tp-form__field">
                                <div className="tp-form__label">Risk</div>
                                <select
                                    className="tp-input"
                                    value={latestDraft.risk}
                                    onChange={(e) =>
                                        setLatestDraft((d) => ({
                                            ...d,
                                            risk: e.target.value,
                                        }))
                                    }
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </label>

                            <label className="tp-form__field">
                                <div className="tp-form__label">Status</div>
                                <select
                                    className="tp-input"
                                    value={latestDraft.status}
                                    onChange={(e) =>
                                        setLatestDraft((d) => ({
                                            ...d,
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
                                <div className="tp-form__label">Notes</div>
                                <textarea
                                    className="tp-input tp-textarea"
                                    rows={6}
                                    value={latestDraft.note}
                                    onChange={(e) =>
                                        setLatestDraft((d) => ({
                                            ...d,
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
                                onClick={() => setOpenLatestModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="tp-btn"
                                disabled={savingLatest}
                            >
                                {savingLatest ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Quick update modal (append note) */}
            <Modal
                open={openQuickUpdate}
                title="Quick update · Notes"
                onClose={() => setOpenQuickUpdate(false)}
            >
                {!latest ? (
                    <div className="tp-empty">No latest section.</div>
                ) : (
                    <form className="tp-form" onSubmit={handleQuickUpdate}>
                        <div className="tp-form__grid">
                            <label className="tp-form__field tp-form__field--span2">
                                <div className="tp-form__label">
                                    Append note
                                </div>
                                <textarea
                                    className="tp-input tp-textarea"
                                    rows={6}
                                    value={quickDraft.noteAppend}
                                    onChange={(e) =>
                                        setQuickDraft({
                                            noteAppend: e.target.value,
                                        })
                                    }
                                    placeholder="Type a quick update to append to existing notes..."
                                />
                            </label>
                        </div>

                        <div className="tp-form__actions">
                            <button
                                type="button"
                                className="tp-btn tp-btn--ghost"
                                onClick={() => setOpenQuickUpdate(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="tp-btn"
                                disabled={savingQuick}
                            >
                                {savingQuick ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <div style={{ display: "none" }}>
                <Link
                    to={`/workspace/patients/folder/${folderId}/${prId}/section/new`}
                >
                    Create section
                </Link>
            </div>
        </div>
    );
}
