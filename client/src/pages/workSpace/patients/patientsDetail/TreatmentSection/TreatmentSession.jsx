// TreatmentSession.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./treatmentSession.css";
import { EditIcon, RemoveIcon, AddIcon, EndIcon } from "../../../Icon.jsx";
import StageModal from "./StageModal.jsx";
import CreateSessionModal from "./CreateSessionPage.jsx"; // your existing modal/page component

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

function ActionsDropdown({ onEndSession, onCreateSession }) {
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
                            onEndSession?.();
                        }}
                    >
                        <EndIcon size={16} />
                        End session
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

export default function TreatmentSession({
    patientRecordId,
    loading,
    error,
    sessions,
    latest,
    onUpdateLatest,
    onRefetch,
}) {
    const { folderId, patientRecordId: prIdFromUrl } = useParams();
    const prId = patientRecordId || prIdFromUrl;
    const navigate = useNavigate();

    // ---- Modals
    const [openEndSession, setOpenEndSession] = useState(false);
    const [openQuickUpdate, setOpenQuickUpdate] = useState(false);
    const [openCreateSession, setOpenCreateSession] = useState(false);

    const [savingEnd, setSavingEnd] = useState(false);
    const [savingQuick, setSavingQuick] = useState(false);

    // ---- End-session draft
    const [endDraft, setEndDraft] = useState({
        endStatus: "Completed",
        endNote: "",
    });

    useEffect(() => {
        if (!openEndSession) return;
        setEndDraft({
            endStatus: "Completed",
            endNote: "",
        });
    }, [openEndSession]);

    // ---- Quick update
    const [quickDraft, setQuickDraft] = useState({ noteAppend: "" });
    useEffect(() => {
        if (!openQuickUpdate) return;
        setQuickDraft({ noteAppend: "" });
    }, [openQuickUpdate]);

    const handleEndSession = async (e) => {
        e.preventDefault();
        if (!onUpdateLatest || !latest?.id) return;

        setSavingEnd(true);
        try {
            const append = (endDraft.endNote || "").trim();
            const mergedNote =
                (latest?.note || "") +
                (append ? (latest?.note ? "\n" : "") + append : "");

            // Mark the latest session as ended (status => Completed/Cancelled)
            await onUpdateLatest(latest.id, {
                status: endDraft.endStatus,
                note: mergedNote,
            });

            setOpenEndSession(false);

            // After ending, immediately open create-session modal for the next session
            setOpenCreateSession(true);

            onRefetch?.();
        } finally {
            setSavingEnd(false);
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

            await onUpdateLatest(latest.id, { note: mergedNote });

            setOpenQuickUpdate(false);
            onRefetch?.();
        } finally {
            setSavingQuick(false);
        }
    };

    const handleDeleteLatest = async () => {
        // NOTE: There is no delete endpoint yet.
        alert("There is no DELETE session endpoint yet.");
    };

    return (
        <div
            className="tp-page"
            style={{ marginTop: 18, padding: 0, maxWidth: "unset" }}
        >
            {/* Header */}
            <div className="tp-header" style={{ marginBottom: 14 }}>
                <div className="pd-treatment">
                    {/* CLICK TITLE => GO TO DETAIL PAGE */}
                    <h3
                        style={{ cursor: "pointer" }}
                        title="Open treatment details"
                        onClick={() => {
                            if (!folderId || !prId) return;
                            navigate(
                                `/workspace/patients/folder/${folderId}/${prId}/treatment`
                            );
                        }}
                    >
                        Treatment Progress
                    </h3>
                </div>

                <div className="tp-header__actions">
                    <ActionsDropdown
                        onEndSession={() => setOpenEndSession(true)}
                        onCreateSession={() => setOpenCreateSession(true)}
                    />
                </div>
            </div>

            {error ? <div className="tp-error">{error}</div> : null}

            {loading ? (
                <div className="tp-empty">Loading...</div>
            ) : (
                <div className="tp-grid">
                    {/* Latest session card */}
                    <section className="tp-card">
                        <div className="tp-card__top">
                            <div>
                                <div className="tp-card__kicker">STAGE 3</div>
                                <div className="tp-card__title">
                                    Latest session
                                </div>
                            </div>
                            <span className="tp-chip">Update</span>
                        </div>

                        {!latest ? (
                            <div className="tp-empty">No latest session.</div>
                        ) : (
                            <>
                                {/* Click latest => go to detail page */}
                                <button
                                    className="tp-latest-click"
                                    onClick={() => {
                                        if (!folderId || !prId) return;
                                        navigate(
                                            `/workspace/patients/folder/${folderId}/${prId}/treatment`
                                        );
                                    }}
                                    title="Click to view all sessions"
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
                                    <div className="tp-notes__label">Notes</div>
                                    <div className="tp-notes__text">
                                        {latest.note || (
                                            <span className="tp-muted">—</span>
                                        )}
                                    </div>
                                </div>

                                <div className="tp-actions">
                                    <button
                                        className="tp-btn-icon tp-btn-icon--ghost"
                                        onClick={() => setOpenQuickUpdate(true)}
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
            )}

            {/* ================= MODALS ================= */}

            {/* End session (replaces Edit plan) */}
            <StageModal
                open={openEndSession}
                title="End session"
                onClose={() => setOpenEndSession(false)}
            >
                {!latest ? (
                    <div className="tp-empty">No latest session.</div>
                ) : (
                    <form className="tp-form" onSubmit={handleEndSession}>
                        <div className="tp-form__grid">
                            <label className="tp-form__field">
                                <div className="tp-form__label">End status</div>
                                <select
                                    className="tp-input"
                                    value={endDraft.endStatus}
                                    onChange={(e) =>
                                        setEndDraft((p) => ({
                                            ...p,
                                            endStatus: e.target.value,
                                        }))
                                    }
                                >
                                    <option>Completed</option>
                                    <option>Cancelled</option>
                                </select>
                            </label>

                            <label className="tp-form__field tp-form__field--span2">
                                <div className="tp-form__label">
                                    Closing notes (optional)
                                </div>
                                <textarea
                                    className="tp-input tp-textarea"
                                    rows={6}
                                    value={endDraft.endNote}
                                    onChange={(e) =>
                                        setEndDraft((p) => ({
                                            ...p,
                                            endNote: e.target.value,
                                        }))
                                    }
                                    placeholder="Add a closing note for this session..."
                                />
                            </label>

                            <div className="tp-empty" style={{ marginTop: 6 }}>
                                This action marks the latest session as ended.
                                After saving, you can create a new session.
                            </div>
                        </div>

                        <div className="tp-form__actions">
                            <button
                                type="button"
                                className="tp-btn tp-btn--ghost"
                                onClick={() => setOpenEndSession(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="tp-btn"
                                disabled={savingEnd}
                            >
                                {savingEnd ? "Saving..." : "End session"}
                            </button>
                        </div>
                    </form>
                )}
            </StageModal>

            {/* Quick update */}
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
            </StageModal>

            {/* Create session modal */}
            <CreateSessionModal
                open={openCreateSession}
                onClose={() => setOpenCreateSession(false)}
                patientRecordId={prId}
                folderId={folderId}
                onCreated={() => {
                    setOpenCreateSession(false);
                    onRefetch?.();
                }}
            />

            {/* hidden link */}
            <div style={{ display: "none" }}>
                <Link
                    to={`/workspace/patients/folder/${folderId}/${prId}/treatment`}
                >
                    Treatment details
                </Link>
            </div>
        </div>
    );
}
