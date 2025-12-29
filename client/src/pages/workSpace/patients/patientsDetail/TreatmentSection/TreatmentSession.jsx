// TreatmentSession.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './TreatmentSession.css'
import StageModal from './StageModal.jsx'
import { apiUtils } from '../../../../../utils/newRequest.js'
import { AddIcon, EndIcon } from '../../../Icon.jsx'

function RiskBadge({ level = 'Low' }) {
    const norm = (level || 'Low').toLowerCase()
    const cls = norm.includes('high') ? 'high' : norm.includes('medium') ? 'medium' : 'low'
    return <span className={`tp-risk tp-risk--${cls}`}>{level}</span>
}

function SeverityPill({ value = 0 }) {
    const v = Math.max(0, Math.min(10, Number(value) || 0))
    const fillStyle = { width: `${(v / 10) * 100}%` }
    return (
        <div className='tp-severity'>
            <div className='tp-severity__label'>Overall severity</div>
            <div className='tp-severity__bar' aria-label={`Severity ${v} out of 10`}>
                <div className='tp-severity__fill' style={fillStyle}></div>
            </div>
            <div className='tp-severity__value'>{v}/10</div>
        </div>
    )
}

function ActionsDropdown({ onCompleteStage, onCreateSession, canComplete = true }) {
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
                        disabled={!canComplete}
                        onClick={() => {
                            if (!canComplete) return
                            setOpen(false)
                            onCompleteStage?.()
                        }}
                        style={!canComplete ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
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

export default function TreatmentSession({ patientRecordId, folderId: folderIdProp, loading, error, sessions, latest, onUpdateLatest, onRefetch, readOnly }) {
    const { folderId: folderIdParam, patientRecordId: prIdFromUrl } = useParams()
    const prId = patientRecordId || prIdFromUrl
    const folderId = folderIdProp || folderIdParam
    const navigate = useNavigate()
    const goToTreatment = () => {
        if (!folderId || !prId) return
        navigate(`/workspace/patients/folder/${folderId}/${prId}/treatment`)
    }
    const goToCreateSession = () => {
        if (!folderId || !prId) return
        navigate(`/workspace/patients/folder/${folderId}/${prId}/treatment/create-session`)
    }

    // ---- Complete stage modal
    const [confirmStage, setConfirmStage] = useState(false)
    const [savingStage, setSavingStage] = useState(false)

    const currentLatest = latest || (Array.isArray(sessions) && sessions.length ? sessions[0] : null)
    const stageLabelRaw = currentLatest?.stage || currentLatest?.status || 'Stage 1'
    const stageLabel = stageLabelRaw.replace(/&amp;/g, '&')

    return (
        <div className='tp'>
            {/* Header */}
            <div className='tp-header'>
                <div className='pd-treatment'>
                    <h3 title='Open treatment details' onClick={goToTreatment}>
                        Treatment Progress
                    </h3>
                </div>

                <div className='tp-header__actions'>
                    {prId && !readOnly ? <ActionsDropdown canComplete={!!currentLatest} onCompleteStage={() => setConfirmStage(true)} onCreateSession={goToCreateSession} /> : null}
                </div>
            </div>

            {error ? <div className='tp-error'>{error}</div> : null}

            {loading ? (
                <div className='tp-session'>Loading...</div>
            ) : (
                <div>
                    {/* Latest session card */}
                    <section className='tp-card'>
                        <div className='tp-card__top'>
                            <div>
                                <div className='tp-card__kicker'>{stageLabel}</div>
                                <div className='tp-card__title'>Latest session</div>
                            </div>
                        </div>

                        {!currentLatest ? (
                            <div className='tp-session'>No latest session.</div>
                        ) : (
                            <>
                                {/* Click latest => go to detail page */}
                                <button className='tp-latest-click' onClick={goToTreatment} title='Click to view all sessions'>
                                    <div className='tp-latest__row'>
                                        <div className='tp-latest__meta'>
                                            <div className='tp-latest__date'>{currentLatest.date || '—'}</div>
                                            <div className='tp-latest__focus'>{currentLatest.focus || '—'}</div>
                                        </div>
                                        <RiskBadge level={currentLatest.risk || 'Low'} />
                                    </div>

                                    <div className='tp-metrics'>
                                        <div className='tp-metric'>
                                            <div className='tp-metric__label'>PHQ-9</div>
                                            <div className='tp-metric__value'>{currentLatest.phq9 ?? '—'}</div>
                                        </div>
                                        <div className='tp-metric'>
                                            <div className='tp-metric__label'>GAD-7</div>
                                            <div className='tp-metric__value'>{currentLatest.gad7 ?? '—'}</div>
                                        </div>
                                    </div>

                                    <SeverityPill value={currentLatest.severity ?? 0} />
                                </button>

                                <div className='tp-notes'>
                                    <div className='tp-notes__label'>Notes</div>
                                    <div className='tp-notes__text'>{currentLatest.note || <span className='tp-muted'>—</span>}</div>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}

            {/* Complete stage modal */}
            <StageModal open={confirmStage} title='Complete stage' onClose={() => setConfirmStage(false)}>
                {!currentLatest ? (
                    <div className='tp-session'>No latest session.</div>
                ) : (
                    <div className='tp-form'>
                        <div className='tp-session' style={{ marginBottom: 12 }}>
                            Mark <strong>{stageLabel}</strong> as completed?
                        </div>
                        <div className='tp-form__actions'>
                            <button type='button' className='tp-btn tp-btn--ghost' onClick={() => setConfirmStage(false)}>
                                No
                            </button>
                            <button
                                type='button'
                                className='tp-btn'
                                disabled={savingStage}
                                onClick={async () => {
                                    if (readOnly) return
                                    if (!patientRecordId) return
                                    setSavingStage(true)
                                    try {
                                        const recordRes = await apiUtils.get(`/patientRecord/readPatientRecord/${patientRecordId}`)
                                        const recordData = recordRes?.data?.metadata?.patientRecord || recordRes?.data?.patientRecord || null
                                        const recordId = recordData?.recordId || recordData?._id
                                        const stageKey = String(stageLabelRaw).toLowerCase().includes('stage 2') ? 'stage2' : String(stageLabelRaw).toLowerCase().includes('stage 3') ? 'stage3' : 'stage1'
                                        await apiUtils.patch(`/patientRecord/updatePatientRecord/${recordId}`, {
                                            treatmentPlan: {
                                                ...(recordData?.treatmentPlan || {}),
                                                stageStatus: {
                                                    ...(recordData?.treatmentPlan?.stageStatus || {}),
                                                    [stageKey]: true,
                                                },
                                            },
                                        })
                                        setConfirmStage(false)
                                        onRefetch?.()
                                    } catch (err) {
                                        console.error(err)
                                    }
                                    setSavingStage(false)
                                }}
                            >
                                {savingStage ? 'Completing...' : 'Yes'}
                            </button>
                        </div>
                    </div>
                )}
            </StageModal>
        </div>
    )
}
