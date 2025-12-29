// TreatmentDetailPage.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './TreatmentSession.css'
import { RemoveIcon, AddIcon, EndIcon } from '../../../Icon.jsx'
import StageModal from './StageModal.jsx'
import { apiUtils } from '../../../../../utils/newRequest.js'
import { useAuth } from '../../../../../contexts/auth/AuthContext'

function RiskBadge({ level = 'Low' }) {
    const norm = (level || 'Low').toLowerCase()
    const cls = norm.includes('high') ? 'high' : norm.includes('medium') ? 'medium' : 'low'
    return <span className={`tp-risk tp-risk--${cls}`}>{level}</span>
}

function SeverityPill({ value = 0 }) {
    const v = Math.max(0, Math.min(10, Number(value) || 0))
    return (
        <div className='tp-severity'>
            <div className='tp-severity__label'>Overall severity</div>
            <div className='tp-severity__bar' aria-label={`Severity ${v} out of 10`}>
                <div className='tp-severity__fill' />
            </div>
            <div className='tp-severity__value'>{v}/10</div>
        </div>
    )
}

function ActionsDropdown({ onCompleteStage, onCreateSession }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const onDoc = (e) => {
            if (!ref.current) return
            if (!ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onDoc)
        return () => document.removeEventListener('mousedown', onDoc)
    }, [])

    return (
        <div className='tp-dd' ref={ref}>
            <button className='tp-btn-icon tp-btn-icon--primary' onClick={() => setOpen((v) => !v)} type='button'>
                <svg className='size-6' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e3e3e3'>
                    <path d='M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z' />
                </svg>
            </button>

            {open && (
                <div className='tp-dd__menu'>
                    <button
                        className='tp-dd__item'
                        type='button'
                        onClick={() => {
                            setOpen(false)
                            onCompleteStage?.()
                        }}
                    >
                        <EndIcon size={16} />
                        Complete Stage
                    </button>

                    <button
                        className='tp-dd__item'
                        type='button'
                        onClick={() => {
                            setOpen(false)
                            onCreateSession?.()
                        }}
                    >
                        <AddIcon size={16} />
                        Create session
                    </button>
                </div>
            )}
        </div>
    )
}

export default function TreatmentDetailPage() {
    const { folderId, patientRecordId } = useParams()
    const navigate = useNavigate()
    const { userInfo } = useAuth()
    const isReadOnly = userInfo?.role === 'family' || userInfo?.role === 'member'
    const goToCreateSession = () => {
        navigate(`/workspace/patients/folder/${folderId}/${patientRecordId}/treatment/create-session`)
    }

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [record, setRecord] = useState(null)

    // UI state
    const [query, setQuery] = useState('')
    const [expandedStage3, setExpandedStage3] = useState(true)
    const [sessionDetail, setSessionDetail] = useState(null)

    // Modals
    const [openPlanModal, setOpenPlanModal] = useState(false)
    const [openQuickUpdate, setOpenQuickUpdate] = useState(false)

    const [savingPlan, setSavingPlan] = useState(false)
    const [confirmStage, setConfirmStage] = useState(false)
    const [savingQuick, setSavingQuick] = useState(false)

    // drafts
    const [planDraft, setPlanDraft] = useState({
        title: '',
        goals: '',
        startDate: '',
        frequency: '',
    })

    const [quickDraft, setQuickDraft] = useState({ noteAppend: '' })

    const refetch = async () => {
        if (!patientRecordId) return
        setError('')
        setLoading(true)
        try {
            const res = await apiUtils.get(`/patientRecord/readPatientRecord/${patientRecordId}`)

            const fetched = res?.data?.metadata?.patientRecord || res?.data?.patientRecord || null

            setRecord(fetched)
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load treatment data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientRecordId])

    // mapping data
    const plan = record?.treatmentPlan || record?.plan || record?.treatmentProcess || null
    const stageStatus = plan?.stageStatus || {}
    const sessions = Array.isArray(record?.treatmentSections) ? record.treatmentSections : []
    const latest = sessions?.[0] || null
    const decodeText = (text) => (typeof text === 'string' ? text.replaceAll('&amp;', '&') : text)
    const getStageNumber = (stage) => {
        if (!stage) return 1
        const match = String(stage).match(/Stage\s*(\d)/i)
        return match ? Number(match[1]) : 1
    }
    const latestStage = latest ? getStageNumber(latest.stage || latest.status) : 1

    // group by stage
    const groupedByStage = useMemo(() => {
        const groups = { 1: [], 2: [], 3: [] }
        sessions.forEach((s) => {
            const n = getStageNumber(s.stage || s.status)
            if (!groups[n]) groups[n] = []
            groups[n].push(s)
        })
        return groups
    }, [sessions])

    // init drafts when open
    useEffect(() => {
        if (!openPlanModal) return
        setPlanDraft({
            title: plan?.title || '',
            goals: plan?.goals || '',
            startDate: plan?.startDate || '',
            frequency: plan?.frequency || '',
        })
    }, [openPlanModal, plan])

    useEffect(() => {
        if (!openQuickUpdate) return
        setQuickDraft({ noteAppend: '' })
    }, [openQuickUpdate])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return sessions
        return sessions.filter((s) => {
            const hay = `${s.date} ${s.focus} ${s.note} ${s.status} ${s.risk}`.toLowerCase()
            return hay.includes(q)
        })
    }, [sessions, query])

    const handleSavePlan = async (e) => {
        e.preventDefault()
        if (isReadOnly) return
        if (!record) return

        const recordId = record.recordId || record._id
        if (!recordId) return

        setSavingPlan(true)
        try {
            await apiUtils.patch(`/patientRecord/updatePatientRecord/${recordId}`, {
                ...record,
                treatmentPlan: {
                    ...(record.treatmentPlan || {}),
                    ...planDraft,
                },
            })
            setOpenPlanModal(false)
            await refetch()
        } catch (e2) {
            setError(e2?.response?.data?.message || e2?.message || 'Save plan failed')
        } finally {
            setSavingPlan(false)
        }
    }

    const handleCompleteStage = async () => {
        if (isReadOnly) return
        if (!record || !latest) return
        const recordId = record.recordId || record._id
        if (!recordId) return

        const stageKey = `stage${latestStage}`
        setSavingPlan(true)
        try {
            await apiUtils.patch(`/patientRecord/updatePatientRecord/${recordId}`, {
                treatmentPlan: {
                    ...(record.treatmentPlan || {}),
                    stageStatus: { ...(stageStatus || {}), [stageKey]: true },
                },
            })
            setConfirmStage(false)
            await refetch()
        } catch (e2) {
            setError(e2?.response?.data?.message || e2?.message || 'Complete stage failed')
        } finally {
            setSavingPlan(false)
        }
    }

    const handleQuickUpdate = async (e) => {
        e.preventDefault()
        if (isReadOnly) return
        if (!record || !latest?.id) return

        const append = (quickDraft.noteAppend || '').trim()
        if (!append) return

        const recordId = record.recordId || record._id
        if (!recordId) return

        setSavingQuick(true)
        try {
            const mergedNote = (latest?.note || '') + (latest?.note ? '\n' : '') + append

            const nextSessions = sessions.map((s) => (s.id === latest.id ? { ...s, note: mergedNote } : s))

            await apiUtils.patch(`/patientRecord/updatePatientRecord/${recordId}`, {
                ...record,
                treatmentSections: nextSessions,
            })

            setOpenQuickUpdate(false)
            await refetch()
        } catch (e2) {
            setError(e2?.response?.data?.message || e2?.message || 'Quick update failed')
        } finally {
            setSavingQuick(false)
        }
    }

    const handleDeleteLatest = async () => {
        alert('No DELETE session endpoint yet.')
    }

    return (
        <div className='tp-page'>
            <div className='tp-header'>
                <div className='pd-treatment'>
                    <h3>Treatment Progress</h3>
                </div>

                <div className='tp-header__actions'>
                    <button className='tp-btn tp-btn--ghost' type='button' onClick={() => navigate(`/workspace/patients/folder/${folderId}/${patientRecordId}`)}>
                        ← Back
                    </button>

                    {latest && !isReadOnly ? <ActionsDropdown onCompleteStage={() => setConfirmStage(true)} onCreateSession={goToCreateSession} /> : null}
                </div>
            </div>

            {error ? <div className='tp-error'>{error}</div> : null}
            {loading ? (
                <div className='tp-session'>Loading...</div>
            ) : (
                <>
                    {[1, 2, 3]
                        .filter((stageNum) => (groupedByStage[stageNum] || []).length > 0)
                        .map((stageNum) => {
                            const list = groupedByStage[stageNum] || []
                            const rawLabel = list[0]?.stage || list[0]?.status || `Stage ${stageNum}`
                            const stageLabel = decodeText(rawLabel)
                            return (
                                <section className='tp-card tp-card--full' key={stageNum}>
                                    <div className='tp-card__top'>
                                        <div>
                                            <div className='tp-card__kicker'>{stageLabel}</div>
                                            <div className='tp-card__title'>Sessions</div>
                                        </div>

                                        <div className='tp-list__tools'>
                                            <input className='tp-input' placeholder='Search sessions (date, focus, notes, status, risk)...' value={query} onChange={(e) => setQuery(e.target.value)} />
                                        </div>
                                    </div>

                                    {!expandedStage3 ? (
                                        <div className='tp-session'>
                                            Click the <b>Latest session</b> card to view the full stage.
                                        </div>
                                    ) : !filtered?.length ? (
                                        <div className='tp-session'>No sessions.</div>
                                    ) : (
                                        <div className='tp-table'>
                                            <div className='tp-row tp-row--head'>
                                                <div>DATE</div>
                                                <div>RESULT</div>
                                                <div>SCORES</div>
                                                <div>SEVERITY</div>
                                                <div>RISK</div>
                                                <div />
                                            </div>

                                            {filtered
                                                .filter((s) => getStageNumber(s.stage || s.status) === stageNum)
                                                .map((s) => (
                                                    <div
                                                        className='tp-row'
                                                        key={s.id || `${s.date}-${s.focus}`}
                                                        onClick={() => setSessionDetail(s)}
                                                        style={{ cursor: 'pointer' }}
                                                        title='View session details'
                                                    >
                                                        <div className='tp-td tp-td--mono'>{s.date || '—'}</div>

                                                        <div className='tp-td'>
                                                            <div className='tp-td__primary'>{s.result || '—'}</div>
                                                        </div>

                                                        <div className='tp-td tp-td--mono'>
                                                            <span className='tp-score'>PHQ {s.phq9 ?? '—'}</span>
                                                            <span className='tp-score'>GAD {s.gad7 ?? '—'}</span>
                                                        </div>

                                                        <div className='tp-td'>
                                                            <span className='tp-badge'>{s.severity ?? 0}/10</span>
                                                        </div>

                                                        <div className='tp-td'>
                                                            <RiskBadge level={s.risk || 'Low'} />
                                                        </div>
                                                        <div className='tp-td tp-td--right'></div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </section>
                            )
                        })}
                </>
            )}

            {/* MODALS */}
            <StageModal open={!!sessionDetail} title='Session details' onClose={() => setSessionDetail(null)}>
                {sessionDetail ? (
                    <div className='tp-form'>
                        <div className='tp-form__grid'>
                            <label className='tp-form__field'>
                                <div className='tp-form__label'>Date</div>
                                <div className='tp-field__value'>{sessionDetail.date || '—'}</div>
                            </label>
                            <label className='tp-form__field'>
                                <div className='tp-form__label'>Stage</div>
                                <div className='tp-field__value'>{sessionDetail.stage || sessionDetail.status || '—'}</div>
                            </label>
                            <label className='tp-form__field'>
                                <div className='tp-form__label'>Risk</div>
                                <RiskBadge level={sessionDetail.risk || 'Low'} />
                            </label>
                            <label className='tp-form__field'>
                                <div className='tp-form__label'>Severity</div>
                                <div className='tp-field__value'>{sessionDetail.severity ?? '—'}/10</div>
                            </label>
                            <label className='tp-form__field'>
                                <div className='tp-form__label'>PHQ-9</div>
                                <div className='tp-field__value'>{sessionDetail.phq9 ?? '—'}</div>
                            </label>
                            <label className='tp-form__field'>
                                <div className='tp-form__label'>GAD-7</div>
                                <div className='tp-field__value'>{sessionDetail.gad7 ?? '—'}</div>
                            </label>
                            <label className='tp-form__field tp-form__field--span2'>
                                <div className='tp-form__label'>Result</div>
                                <div className='tp-field__value'>{decodeText(sessionDetail.result || sessionDetail.focus || '—')}</div>
                            </label>
                            <label className='tp-form__field tp-form__field--span2'>
                                <div className='tp-form__label'>Notes</div>
                                <div className='tp-field__value tp-muted' style={{ whiteSpace: 'pre-wrap' }}>
                                    {sessionDetail.note || '—'}
                                </div>
                            </label>
                            <label className='tp-form__field tp-form__field--span2'>
                                <div className='tp-form__label'>Symptoms</div>
                                <div className='tp-field__value' style={{ display: 'grid', gap: 8 }}>
                                    {Array.isArray(sessionDetail.symptoms) && sessionDetail.symptoms.length ? (
                                        sessionDetail.symptoms.map((sym, idx) => (
                                            <div
                                                key={sym.id || sym.name || sym.sign || idx}
                                                style={{
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 10,
                                                    padding: '8px 10px',
                                                    background: 'rgba(245,250,248,0.7)',
                                                }}
                                            >
                                                <div style={{ fontWeight: 800 }}>{sym.name || sym.sign || '—'}</div>
                                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4, fontSize: 13 }}>
                                                    <span>Status: {sym.status || '—'}</span>
                                                    <span>Date: {sym.date || '—'}</span>
                                                    {sym.sign ? <span>Sign: {sym.sign}</span> : null}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className='tp-muted'>No symptoms</span>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>
                ) : null}
            </StageModal>
            <StageModal open={confirmStage} title={`Complete Stage ${latestStage}`} onClose={() => setConfirmStage(false)}>
                <div className='tp-session' style={{ marginBottom: 12 }}>
                    Are you sure you want to complete this stage?
                </div>
                <div className='tp-form__actions'>
                    <button type='button' className='tp-btn tp-btn--ghost' onClick={() => setConfirmStage(false)}>
                        No
                    </button>
                    <button type='button' className='tp-btn' onClick={handleCompleteStage} disabled={savingPlan}>
                        {savingPlan ? 'Completing...' : 'Yes'}
                    </button>
                </div>
            </StageModal>

            <StageModal open={openPlanModal} title='Stage 2 · Edit treatment plan' onClose={() => setOpenPlanModal(false)}>
                <form className='tp-form' onSubmit={handleSavePlan}>
                    <div className='tp-form__grid'>
                        <label className='tp-form__field tp-form__field--span2'>
                            <div className='tp-form__label'>Title</div>
                            <input
                                className='tp-input'
                                value={planDraft.title}
                                onChange={(e) =>
                                    setPlanDraft((p) => ({
                                        ...p,
                                        title: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className='tp-form__field tp-form__field--span2'>
                            <div className='tp-form__label'>Goals</div>
                            <textarea
                                className='tp-input tp-textarea'
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

                        <label className='tp-form__field'>
                            <div className='tp-form__label'>Start date</div>
                            <input
                                className='tp-input'
                                type='date'
                                value={planDraft.startDate}
                                onChange={(e) =>
                                    setPlanDraft((p) => ({
                                        ...p,
                                        startDate: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className='tp-form__field'>
                            <div className='tp-form__label'>Frequency</div>
                            <input
                                className='tp-input'
                                value={planDraft.frequency}
                                onChange={(e) =>
                                    setPlanDraft((p) => ({
                                        ...p,
                                        frequency: e.target.value,
                                    }))
                                }
                                placeholder='e.g. 1 session/week'
                            />
                        </label>
                    </div>

                    <div className='tp-form__actions'>
                        <button type='button' className='tp-btn tp-btn--ghost' onClick={() => setOpenPlanModal(false)}>
                            Cancel
                        </button>
                        <button type='submit' className='tp-btn' disabled={savingPlan}>
                            {savingPlan ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </StageModal>

            <StageModal open={openQuickUpdate} title='Quick update · Notes' onClose={() => setOpenQuickUpdate(false)}>
                {!latest ? (
                    <div className='tp-session'>No latest session.</div>
                ) : (
                    <form className='tp-form' onSubmit={handleQuickUpdate}>
                        <div className='tp-form__grid'>
                            <label className='tp-form__field tp-form__field--span2'>
                                <div className='tp-form__label'>Append note</div>
                                <textarea
                                    className='tp-input tp-textarea'
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

                        <div className='tp-form__actions'>
                            <button type='button' className='tp-btn tp-btn--ghost' onClick={() => setOpenQuickUpdate(false)}>
                                Cancel
                            </button>
                            <button type='submit' className='tp-btn' disabled={savingQuick}>
                                {savingQuick ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                )}
            </StageModal>
        </div>
    )
}
