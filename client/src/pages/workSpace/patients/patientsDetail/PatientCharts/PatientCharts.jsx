import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { Pencil } from 'lucide-react'
import './patientCharts.css'
import { apiUtils } from '../../../../../utils/newRequest' // Đảm bảo đường dẫn đúng
import { useAuth } from '../../../../../contexts/auth/AuthContext'

const THEME_COLOR = '#0F9D87'
const RISK_COLORS = {
    Low: '#34D399',
    Medium: '#FBBF24',
    High: '#EF4444',
}

// --- Sub-Components ---
const EmptyChart = ({ message }) => (
    <div className='chart-card empty-chart' style={{ textAlign: 'center', padding: '40px', background: '#f9fafb' }}>
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>{message}</p>
    </div>
)

const HistoryLineChart = ({ title, data, dataKey, max, color }) => (
    <div className='chart-card'>
        <h3 className='chart-title'>{title}</h3>
        <div className='chart-container'>
            <ResponsiveContainer width='100%' height={200}>
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid vertical={false} stroke='#E5E7EB' strokeDasharray='5 5' />
                    <XAxis dataKey='name' tick={{ fontSize: 12, fill: '#6B7280' }} interval='preserveStartEnd' />
                    <YAxis domain={[0, max]} allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                    <Line type='monotone' dataKey={dataKey} stroke={color || THEME_COLOR} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} animationDuration={1000} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
)

// --- MAIN COMPONENT ---
export default function PatientCharts({ patientIdProp }) {
    const { patientRecordId } = useParams() // Lấy ID từ URL
    const { userInfo } = useAuth()

    const [chartData, setChartData] = useState({ history: [], latest: null })
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
        const fetchCharts = async () => {
            // 1. Xác định ID cần fetch (Ưu tiên patientRecordId từ URL)
            // Nếu component được nhúng vào chỗ khác không có URL params, dùng props
            const targetId = patientRecordId || patientIdProp

            if (!targetId) {
                console.log('No ID provided for charts')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setErrorMsg(null)

                console.log('Fetching record for Charts, ID:', targetId)

                // 2. DÙNG API readPatientRecord (Thay vì readPatientCharts)
                // API này trả về toàn bộ record bao gồm treatmentSections chứa PHQ9/GAD7
                const res = await apiUtils.get(`/patientRecord/readPatientRecord/${targetId}`)

                // Lấy data từ response (cấu trúc giống trang TreatmentDetail)
                const record = res?.data?.metadata?.patientRecord || res?.data?.patientRecord

                if (!record) {
                    throw new Error('Patient record not found')
                }

                // 3. XỬ LÝ DỮ LIỆU (QUAN TRỌNG)
                // Lấy mảng treatmentSections
                const sessions = Array.isArray(record.treatmentSections) ? record.treatmentSections : []

                if (sessions.length > 0) {
                    // Map dữ liệu sang format của Recharts
                    const formattedData = sessions.map((session) => ({
                        name: session.date || 'Unknown',
                        // Ép kiểu về Number để vẽ biểu đồ, nếu null thì để null để ngắt nét vẽ hoặc về 0
                        phq9: session.phq9 !== undefined && session.phq9 !== null ? Number(session.phq9) : null,
                        gad7: session.gad7 !== undefined && session.gad7 !== null ? Number(session.gad7) : null,
                        severity: session.severity !== undefined ? Number(session.severity) : 0,
                        risk: session.risk || 'Low',
                    }))

                    // Đảo ngược mảng: API thường trả về Mới -> Cũ.
                    // Biểu đồ cần vẽ thời gian từ trái (Cũ) -> phải (Mới).
                    const chartHistory = [...formattedData].reverse()

                    // Lấy số liệu mới nhất (là phần tử cuối cùng của mảng đã đảo ngược)
                    const latestData = chartHistory[chartHistory.length - 1]

                    setChartData({
                        history: chartHistory,
                        latest: latestData,
                    })
                } else {
                    // Nếu chưa có session nào
                    setChartData({ history: [], latest: null })
                }
            } catch (err) {
                console.error('Chart Error:', err)
                // Nếu lỗi 404 (không tìm thấy) thì coi như chưa có dữ liệu, không báo lỗi đỏ
                if (err?.response?.status === 404) {
                    setChartData({ history: [], latest: null })
                } else {
                    setErrorMsg(err?.response?.data?.message || 'Unable to load chart data')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchCharts()
    }, [patientRecordId, patientIdProp, userInfo])

    // --- Render ---
    if (loading)
        return (
            <div className='charts-section'>
                <p>Loading assessment charts...</p>
            </div>
        )

    if (errorMsg)
        return (
            <div className='charts-section'>
                <EmptyChart message={errorMsg} />
            </div>
        )

    const { history, latest } = chartData

    // Nếu không có dữ liệu history
    if (!history || history.length === 0) {
        return (
            <div className='charts-section'>
                <EmptyChart message='No assessment records (PHQ-9/GAD-7) found in treatment sessions.' />
            </div>
        )
    }

    // Data cho biểu đồ Risk
    const riskBarData = ['Low', 'Medium', 'High'].map((r) => ({
        name: r,
        value: (latest?.risk || 'Low') === r ? 0.9 : 0.05,
        color: RISK_COLORS[r],
    }))

    return (
        <div className='charts-section'>
            <div className='charts-header'>
                <h2>Health Trends & Overview</h2>
            </div>

            <div className='charts-grid'>
                {/* 1. PHQ-9 Line Chart */}
                <HistoryLineChart title='Depression (PHQ-9)' dataKey='phq9' max={27} data={history} />

                {/* 2. GAD-7 Line Chart */}
                <HistoryLineChart title='Anxiety (GAD-7)' dataKey='gad7' max={21} data={history} />

                {/* 3. Severity Bar Chart */}
                <div className='chart-card'>
                    <h3 className='chart-title'>Current Severity (0–10)</h3>
                    <div className='chart-container'>
                        <ResponsiveContainer width='100%' height={200}>
                            <BarChart data={[{ name: 'Severity', value: latest?.severity ?? 0 }]}>
                                <CartesianGrid vertical={false} stroke='#E5E7EB' />
                                <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 10]} allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey='value' fill={THEME_COLOR} barSize={60} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Risk Level Bar Chart */}
                <div className='chart-card'>
                    <h3 className='chart-title'>Current Risk Level</h3>
                    <div className='chart-container'>
                        <ResponsiveContainer width='100%' height={200}>
                            <BarChart data={riskBarData}>
                                <CartesianGrid vertical={false} stroke='#E5E7EB' />
                                <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 1]} hide />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                                    {riskBarData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} fillOpacity={entry.value === 1 ? 1 : 0.3} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
