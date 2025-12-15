// TreatmentDetailPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./treatmentSession.css";
import { EditIcon, RemoveIcon, AddIcon, EndIcon } from "../../../Icon.jsx";
import StageModal from "./StageModal.jsx";
import CreateSessionModal from "./CreateSessionPage.jsx";
import { apiUtils } from "../../../../../utils/newRequest.js";

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

function ActionsDropdown({ onEditPlan, onCreateSession }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onDoc = (e) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    return (
        <div className="tp-dd" ref={ref}>
            <button
                className="tp-btn-icon tp-btn-icon--primary"
                onClick={() => setOpen((v) => !v)}
                type="button"
            >
                ⋮
            </button>

            {open && (
                <div className="tp-dd__menu">
                    <button
                        className="tp-dd__item"
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onEditPlan?.();
                        }}
                    >
                        <EditIcon size={16} />
                        Edit plan
                    </button>

                    <button
                        className="tp-dd__item"
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onCreateSession?.();
                        }}
                    >
                        <AddIcon size={16} />
                        Create session
                    </button>
                </div>
            )}
        </div>
    );
}

export default function TreatmentDetailPage() {
    const { folderId, patientRecordId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [record, setRecord] = useState(null);

    // UI state
    const [query, setQuery] = useState("");
    const [expandedStage3, setExpandedStage3] = useState(true);

    // Modals
    const [openPlanModal, setOpenPlanModal] = useState(false);
    const [openQuickUpdate, setOpenQuickUpdate] = useState(false);
    const [openCreateSession, setOpenCreateSession] = useState(false);

    const [savingPlan, setSavingPlan] = useState(false);
    const [savingQuick, setSavingQuick] = useState(false);

    // drafts
    const [planDraft, setPlanDraft] = useState({
        title: "",
        goals: "",
        startDate: "",
        frequency: "",
    });

    const [quickDraft, setQuickDraft] = useState({ noteAppend: "" });

    const refetch = async () => {
        if (!patientRecordId) return;
        setError("");
        setLoading(true);
        try {
            const res = await apiUtils.get(
                `/patientRecord/readPatientRecord/${patientRecordId}`
            );

            const fetched =
                res?.data?.metadata?.patientRecord ||
                res?.data?.patientRecord ||
                null;

            setRecord(fetched);
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e?.message ||
                    "Failed to load treatment data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientRecordId]);

    // mapping data
    const plan =
        record?.treatmentPlan ||
        record?.plan ||
        record?.treatmentProcess ||
        null;
    const sessions = Array.isArray(record?.treatmentSections)
        ? record.treatmentSections
        : [];
    const latest = sessions?.[0] || null;

    // init drafts when open
    useEffect(() => {
        if (!openPlanModal) return;
        setPlanDraft({
            title: plan?.title || "",
            goals: plan?.goals || "",
            startDate: plan?.startDate || "",
            frequency: plan?.frequency || "",
        });
    }, [openPlanModal, plan]);

    useEffect(() => {
        if (!openQuickUpdate) return;
        setQuickDraft({ noteAppend: "" });
    }, [openQuickUpdate]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return sessions;
        return sessions.filter((s) => {
            const hay =
                `${s.date} ${s.focus} ${s.note} ${s.status} ${s.risk}`.toLowerCase();
            return hay.includes(q);
        });
    }, [sessions, query]);

    // update plan: patch whole record (giống style PatientsDetail đang làm)
    const handleSavePlan = async (e) => {
        e.preventDefault();
        if (!record) return;

        const recordId = record.recordId || record._id;
        if (!recordId) return;

        setSavingPlan(true);
        try {
            await apiUtils.patch(
                `/patientRecord/updatePatientRecord/${recordId}`,
                {
                    ...record,
                    treatmentPlan: {
                        ...(record.treatmentPlan || {}),
                        ...planDraft,
                    },
                }
            );
            setOpenPlanModal(false);
            await refetch();
        } catch (e2) {
            setError(
                e2?.response?.data?.message || e2?.message || "Save plan failed"
            );
        } finally {
            setSavingPlan(false);
        }
    };

    const handleQuickUpdate = async (e) => {
        e.preventDefault();
        if (!record || !latest?.id) return;

        const append = (quickDraft.noteAppend || "").trim();
        if (!append) return;

        const recordId = record.recordId || record._id;
        if (!recordId) return;

        setSavingQuick(true);
        try {
            const mergedNote =
                (latest?.note || "") + (latest?.note ? "\n" : "") + append;

            const nextSessions = sessions.map((s) =>
                s.id === latest.id ? { ...s, note: mergedNote } : s
            );

            await apiUtils.patch(
                `/patientRecord/updatePatientRecord/${recordId}`,
                {
                    ...record,
                    treatmentSections: nextSessions,
                }
            );

            setOpenQuickUpdate(false);
            await refetch();
        } catch (e2) {
            setError(
                e2?.response?.data?.message ||
                    e2?.message ||
                    "Quick update failed"
            );
        } finally {
            setSavingQuick(false);
        }
    };

    const handleDeleteLatest = async () => {
        alert("No DELETE session endpoint yet.");
    };

    return (
        <div
            className="tp-page"
            style={{ marginTop: 18, padding: 0, maxWidth: "unset" }}
        >
            <div className="tp-header" style={{ marginBottom: 14 }}>
                <div className="pd-treatment">
                    <h3>Treatment Progress</h3>
                </div>

                <div
                    className="tp-header__actions"
                    style={{ display: "flex", gap: 10 }}
                >
                    <button
                        className="tp-btn tp-btn--ghost"
                        type="button"
                        onClick={() =>
                            navigate(
                                `/workspace/patients/folder/${folderId}/${patientRecordId}`
                            )
                        }
                    >
                        ← Back
                    </button>

                    <ActionsDropdown
                        onEditPlan={() => setOpenPlanModal(true)}
                        onCreateSession={() => setOpenCreateSession(true)}
                    />
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

                        {/* STAGE 3 - LATEST */}
                        <section className="tp-card">
                            <div className="tp-card__top">
                                <div>
                                    <div className="tp-card__kicker">
                                        STAGE 3
                                    </div>
                                    <div className="tp-card__title">
                                        Latest session
                                    </div>
                                </div>
                                <span className="tp-chip">Update</span>
                            </div>

                            {!latest ? (
                                <div className="tp-empty">
                                    No latest session.
                                </div>
                            ) : (
                                <>
                                    <button
                                        className="tp-latest-click"
                                        onClick={() =>
                                            setExpandedStage3((v) => !v)
                                        }
                                        title="Click to toggle session list"
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

                    {/* STAGE 3 LIST */}
                    <section className="tp-card tp-card--full">
                        <div className="tp-card__top">
                            <div>
                                <div className="tp-card__kicker">STAGE 3</div>
                                <div className="tp-card__title">Sessions</div>
                            </div>

                            <div className="tp-list__tools">
                                <input
                                    className="tp-input"
                                    placeholder="Search sessions (date, focus, notes, status, risk)..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {!expandedStage3 ? (
                            <div className="tp-empty">
                                Click the <b>Latest session</b> card to view the
                                full stage.
                            </div>
                        ) : !filtered?.length ? (
                            <div className="tp-empty">No sessions.</div>
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

            {/* MODALS */}
            <StageModal
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
                                placeholder="e.g. 1 session/week"
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
            </StageModal>

            <StageModal
                open={openQuickUpdate}
                title="Quick update · Notes"
                onClose={() => setOpenQuickUpdate(false)}
            >
                {!latest ? (
                    <div className="tp-empty">No latest session.</div>
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
            </StageModal>

            <CreateSessionModal
                open={openCreateSession}
                onClose={() => setOpenCreateSession(false)}
                patientRecordId={patientRecordId}
                folderId={folderId}
                onCreated={async () => {
                    setOpenCreateSession(false);
                    await refetch();
                    setExpandedStage3(true);
                }}
            />
        </div>
    );
}
