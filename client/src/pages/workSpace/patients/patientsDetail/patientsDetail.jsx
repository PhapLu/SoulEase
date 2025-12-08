import WorkspaceTopBar from '../../../../components/Workspace/WorkspaceTopBar'
import './patientsDetail.css'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiUtils } from '../../../../utils/newRequest'

const chartSeries = [
    {
        title: 'Sleep Quality',
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        data: [80, 60, 70, 65, 72, 85, 92],
    },
    {
        title: 'Mood Rating',
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        data: [60, 70, 65, 68, 66, 78, 90],
    },
    {
        title: 'Stress Level',
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        data: [75, 58, 72, 65, 67, 70, 80],
    },
    {
        title: 'CTB Task Completion',
        type: 'progress',
        value: 68,
    },
]

const ProgressCard = ({ value }) => (
    <div className='pd-progress'>
        <div className='pd-progress__circle'>
            <span>{value}%</span>
        </div>
    </div>
)

const LineChartCard = ({ title, labels, data }) => {
    const viewWidth = 350
    const viewHeight = 100
    const max = Math.max(...data, 100)
    const points = data
        .map((v, idx) => {
            const x = (idx / (data.length - 1 || 1)) * viewWidth
            const y = viewHeight - (v / max) * viewHeight
            return `${x},${y}`
        })
        .join(' ')

    return (
        <div className='pd-card'>
            <div className='pd-card__header'>
                <h4>{title}</h4>
                <button className='pd-icon-btn'>
                    <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e3e3e3'>
                        <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
                    </svg>
                </button>
            </div>
            <div className='pd-chart'>
                <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio='xMidYMid meet'>
                    <polyline fill='none' stroke='#0a8769' strokeWidth='2' points={points} />
                    {data.map((v, idx) => {
                        const x = (idx / (data.length - 1 || 1)) * viewWidth
                        const y = viewHeight - (v / max) * viewHeight
                        return <circle key={idx} cx={x} cy={y} r='2.8' fill='#0a8769' />
                    })}
                </svg>
                <div className='pd-chart__labels'>
                    {labels.map((l) => (
                        <span key={l}>{l}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function PatientsDetail() {
    const [patient, setPatient] = useState(null)
    const { folderId, patientRecordId } = useParams()

    useEffect(() => {
        if (!patientRecordId) return

        const fetchPatient = async () => {
            try {
                const res = await apiUtils.get(`/patientRecord/readPatientRecord/${patientRecordId}`)
                setPatient(res.data.metadata.patientRecord)
            } catch (err) {
                console.error('Failed to fetch patient record', err)
            }
        }

        fetchPatient()
    }, [patientRecordId])

    return (
        <div className='pd-page'>
            <WorkspaceTopBar />

            <div className='pd-inner'>
                <section className='pd-header'>
                    <div className='pd-avatar' />
                    <div className='pd-info'>
                        <div className='pd-info__row'>
                            <h2>{patient?.fullName || 'Patient Name'}</h2>
                            <span className='pd-info__sex'>{patient?.gender || 'N/A'}</span>
                            <button className='pd-icon-btn' aria-label='Edit profile'>
                                <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e3e3e3'>
                                    <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
                                </svg>
                            </button>
                        </div>

                        <div className='pd-info__grid'>
                            <div className='pd-field'>
                                <span className='pd-label'>Email:</span>
                                <a href={`mailto:${patient?.email}`}>{patient?.email || 'N/A'}</a>
                            </div>
                            <div className='pd-field'>
                                <span className='pd-label'>Phone:</span>
                                <span>{patient?.phone || 'N/A'}</span>
                            </div>
                            <div className='pd-field'>
                                <span className='pd-label'>Birthday:</span>
                                <span>{patient?.birthday || 'N/A'}</span>
                            </div>
                            <div className='pd-field'>
                                <span className='pd-label'>Age:</span>
                                <span>{patient?.age || 'N/A'}</span>
                            </div>
                            <div className='pd-field'>
                                <span className='pd-label'>Address:</span>
                                <span>{patient?.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <button className='pd-import-btn'>Import</button>
                </section>

                <section className='pd-charts'>
                    <div className='pd-section-title'>
                        <h3>Chart</h3>
                        <button className='pd-icon-btn'>
                            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e3e3e3'>
                                <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
                            </svg>
                        </button>
                    </div>
                    <div className='pd-chart-blank' />
                </section>

                <section className='pd-symptoms'>
                    <div className='pd-section-title'>
                        <h3>Symptoms</h3>
                        <button className='pd-icon-btn'>
                            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e3e3e3'>
                                <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
                            </svg>
                        </button>
                    </div>
                    <div className='pd-note-card'>
                        <p className='pd-note-placeholder'>Add symptoms for patient</p>
                    </div>
                </section>

                <section className='pd-treatment'>
                    <div className='pd-section-title'>
                        <h3>Treatment Process</h3>
                        <button className='pd-icon-btn'>
                            <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e3e3e3'>
                                <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
                            </svg>
                        </button>
                    </div>
                    <div className='pd-note-card'>
                        <p className='pd-note-placeholder'>Add treatment process for patient</p>
                    </div>
                </section>

                <section className='pd-storage'>
                    <h3>Storage</h3>
                    <div className='pd-storage__tabs'>
                        <button className='active'>Image</button>
                        <button>Files</button>
                    </div>
                    <div className='pd-storage__box' />
                </section>
            </div>
        </div>
    )
}
