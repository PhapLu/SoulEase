// PatientsDetail.jsx
import WorkspaceTopBar from '../../../../components/Workspace/WorkspaceTopBar'
import './patientsDetail.css'
import '../folderClients/folderModelForm/folderModelForm.css'
import { useParams } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { apiUtils } from '../../../../utils/newRequest'

import PatientsHeader from './PatientsHeader'
import SymptomsSection from './SymptomSection/SymptomsSection'
import TreatmentSection from './TreatmentSection/TreatmentSection'
import StorageSection from './StorageSection'
// import { chartSeries } from "./PatientCharts";

export default function PatientsDetail() {
    const { patientRecordId } = useParams()

    // ---------------- PATIENT DATA ----------------
    const [patient, setPatient] = useState(null)
    const [editForm, setEditForm] = useState(null)

    // GLOBAL EDIT MODE
    const [isEditing, setIsEditing] = useState(false)

    // SYMPTOMS EDIT MODE
    const [editingSymptoms, setEditingSymptoms] = useState(false)
    const [originalSymptoms, setOriginalSymptoms] = useState([])

    const [saving, setSaving] = useState(false)

    // ---------------- TREATMENT DATA ----------------
    const [treatmentPlan, setTreatmentPlan] = useState(null)
    const [sections, setSections] = useState([])
    const [latestSection, setLatestSection] = useState(null)

    const [treatmentLoading, setTreatmentLoading] = useState(false)
    const [treatmentError, setTreatmentError] = useState('')

    // ---------------- FETCH PATIENT ----------------
    useEffect(() => {
        if (!patientRecordId) return

        let alive = true

        const fetchPatient = async () => {
            try {
                const res = await apiUtils.get(`/patientRecord/readPatientRecord/${patientRecordId}`)

                const fetched = res?.data?.metadata?.patientRecord || res?.data?.patientRecord || null

                if (!alive) return

                setPatient(fetched)
                setEditForm(
                    fetched
                        ? {
                              ...fetched,
                              symptoms: fetched.symptoms ? [...fetched.symptoms] : [],
                          }
                        : null
                )
            } catch (err) {
                console.error('Failed to fetch patient record', err)
            }
        }

        fetchPatient()

        return () => {
            alive = false
        }
    }, [patientRecordId])

    // ---------------- FETCH TREATMENT ----------------
    const normalizeList = (sectionsRes) => {
        const list = sectionsRes?.data?.metadata?.sections || sectionsRes?.data?.sections || sectionsRes?.data?.items || sectionsRes?.data || []
        return Array.isArray(list) ? list : []
    }

    const normalizePlan = (planRes) => planRes?.data?.metadata?.plan || planRes?.data?.plan || planRes?.data || null

    const normalizeSection = (sectionRes) => sectionRes?.data?.metadata?.section || sectionRes?.data?.section || sectionRes?.data || null

    const fetchTreatment = useCallback(async () => {
        if (!patientRecordId) return

        setTreatmentLoading(true)
        setTreatmentError('')

        try {
            const [planRes, sectionsRes, latestRes] = await Promise.all([apiUtils.get(`/patientRecord/${patientRecordId}/treatment/plan`), apiUtils.get(`/patientRecord/${patientRecordId}/treatment/sections`), apiUtils.get(`/patientRecord/${patientRecordId}/treatment/sections/latest`)])

            setTreatmentPlan(normalizePlan(planRes))
            setSections(normalizeList(sectionsRes))
            setLatestSection(normalizeSection(latestRes))
        } catch (err) {
            console.error('Failed to fetch treatment', err)
            setTreatmentError(err?.message || 'Failed to fetch treatment')
        } finally {
            setTreatmentLoading(false)
        }
    }, [patientRecordId])

    useEffect(() => {
        if (!patientRecordId) return

        let alive = true

        const run = async () => {
            setTreatmentLoading(true)
            setTreatmentError('')

            try {
                const [planRes, sectionsRes, latestRes] = await Promise.all([apiUtils.get(`/patientRecord/${patientRecordId}/treatment/plan`), apiUtils.get(`/patientRecord/${patientRecordId}/treatment/sections`), apiUtils.get(`/patientRecord/${patientRecordId}/treatment/sections/latest`)])

                if (!alive) return

                setTreatmentPlan(normalizePlan(planRes))
                setSections(normalizeList(sectionsRes))
                setLatestSection(normalizeSection(latestRes))
            } catch (err) {
                if (!alive) return
                console.error('Failed to fetch treatment', err)
                setTreatmentError(err?.message || 'Failed to fetch treatment')
            } finally {
                if (alive) setTreatmentLoading(false)
            }
        }

        run()

        return () => {
            alive = false
        }
    }, [patientRecordId])

    // ---------------- TREATMENT API HANDLERS ----------------
    const refetchTreatment = useCallback(async () => {
        await fetchTreatment()
    }, [fetchTreatment])

    const updateTreatmentPlan = useCallback(
        async (payload) => {
            const res = await apiUtils.patch(`/patientRecord/${patientRecordId}/treatment/plan`, payload)
            const updated = normalizePlan(res) || payload
            setTreatmentPlan(updated)
            await refetchTreatment()
            return updated
        },
        [patientRecordId, refetchTreatment]
    )

    const updateLatestSection = useCallback(
        async (sectionId, payload) => {
            const res = await apiUtils.patch(`/patientRecord/${patientRecordId}/treatment/sections/${sectionId}`, payload)
            const updated = normalizeSection(res) || payload
            setLatestSection(updated)
            await refetchTreatment()
            return updated
        },
        [patientRecordId, refetchTreatment]
    )

    const createSection = useCallback(
        async (payload) => {
            // NOTE: ensure apiUtils.post exists in utils/newRequest
            const res = await apiUtils.post(`/patientRecord/${patientRecordId}/treatment/sections`, payload)
            const created = normalizeSection(res) || payload
            await refetchTreatment()
            return created
        },
        [patientRecordId, refetchTreatment]
    )

    // ---------------- PATIENT SAVE (UNIFIED) ----------------
    const persistRecord = async (newForm) => {
        await apiUtils.patch(`/patientRecord/updatePatientRecord/${patientRecordId}`, newForm)
        setPatient(newForm)
        setEditForm(newForm)
    }

    // ------- GLOBAL EDIT --------
    const handleStartEdit = () => {
        setEditForm(
            patient
                ? {
                      ...patient,
                      symptoms: patient.symptoms ? [...patient.symptoms] : [],
                  }
                : {}
        )
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setEditForm(
            patient
                ? {
                      ...patient,
                      symptoms: patient.symptoms ? [...patient.symptoms] : [],
                  }
                : {}
        )
        setIsEditing(false)
    }

    const handleSaveEdit = async () => {
        setSaving(true)
        try {
            await persistRecord(editForm)
            setIsEditing(false)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleFieldChange = (field, value) => {
        if (field === 'phone') {
            const digits = String(value || '')
                .replace(/\D+/g, '')
                .slice(0, 10)
            setEditForm((prev) => ({ ...prev, phone: digits }))
            return
        }
        if (field === 'gender') {
            const g = String(value || '').toLowerCase()
            setEditForm((prev) => ({ ...prev, gender: g }))
            return
        }
        setEditForm((prev) => ({ ...prev, [field]: value }))
    }

    // Auto-calc age from birthday
    useEffect(() => {
        if (!editForm) return
        const b = editForm.birthday
        if (!b) {
            setEditForm((prev) => ({ ...prev, age: '' }))
            return
        }
        const age = calcAge(b)
        setEditForm((prev) => ({ ...prev, age }))
    }, [editForm?.birthday])

    // -------- SYMPTOMS EDIT -------
    const handleEditSymptoms = () => {
        setOriginalSymptoms(editForm?.symptoms || [])
        setEditingSymptoms(true)
    }

    const handleCancelSymptoms = () => {
        setEditForm((prev) => ({
            ...prev,
            symptoms: [...originalSymptoms],
        }))
        setEditingSymptoms(false)
    }

    const handleSaveSymptoms = async () => {
        setSaving(true)
        try {
            const cleanedSymptoms = (editForm?.symptoms || [])
                .map((s) => ({
                    ...s,
                    name: (s.name || '').trim(),
                    sign: (s.sign || '').trim(),
                }))
                .filter((s) => s.name || s.sign)

            const updated = { ...editForm, symptoms: cleanedSymptoms }
            setEditForm(updated)

            await persistRecord(updated)
            setEditingSymptoms(false)
            setOriginalSymptoms(cleanedSymptoms)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleAddSymptom = () => {
        setEditForm((prev) => ({
            ...prev,
            symptoms: [...(prev.symptoms || []), { id: `tmp-${Date.now()}`, name: '', sign: '' }],
        }))

        setTimeout(() => {
            const inputs = document.querySelectorAll('.pd-input--symptom')
            inputs[inputs.length - 2]?.focus()
        }, 50)
    }

    const handleSymptomFieldChange = (index, field, value) => {
        setEditForm((prev) => {
            const list = [...(prev.symptoms || [])]
            if (!list[index]) return prev
            list[index] = { ...list[index], [field]: value }
            return { ...prev, symptoms: list }
        })
    }

    const handleToggleSymptomStatus = async (index) => {
        const list =
            editForm?.symptoms?.map((sym, i) =>
                i === index
                    ? {
                          ...sym,
                          status: sym.status === 'Resolved' ? 'Active' : 'Resolved',
                      }
                    : sym
            ) || []

        const updated = { ...editForm, symptoms: list }
        setEditForm(updated)

        // Nếu không ở chế độ edit Symptoms, lưu ngay
        if (!editingSymptoms) {
            setSaving(true)
            try {
                await persistRecord(updated)
            } catch (err) {
                console.error(err)
            }
            setSaving(false)
        }
    }

    const handleSymptomKeyDown = async (e, index) => {
        if (e.key !== 'Enter') return
        e.preventDefault()

        const updated = {
            ...editForm,
            symptoms: [...(editForm.symptoms || [])],
        }
        if (!updated.symptoms[index]) return

        updated.symptoms[index].name = (updated.symptoms[index].name || '').trim()
        updated.symptoms[index].sign = (updated.symptoms[index].sign || '').trim()

        setEditForm(updated)
        await persistRecord(updated)

        // Auto-add new row
        handleAddSymptom()
    }

    const handleRemoveSymptom = async (index) => {
        const updated = {
            ...editForm,
            symptoms: (editForm.symptoms || []).filter((_, i) => i !== index),
        }

        setEditForm(updated)
        await persistRecord(updated)
    }

    // ---------------- RENDER ----------------
    if (!editForm) return <div>Loading...</div>

    return (
        <div className='pd-page'>
            <WorkspaceTopBar />

            <div className='pd-inner'>
                <PatientsHeader patient={patient} editForm={editForm} isEditing={isEditing} saving={saving} onFieldChange={handleFieldChange} onStartEdit={handleStartEdit} onSaveEdit={handleSaveEdit} onCancelEdit={handleCancelEdit} />

                <SymptomsSection symptoms={editForm.symptoms || []} editingSymptoms={editingSymptoms} setEditingSymptoms={setEditingSymptoms} onEditSymptoms={handleEditSymptoms} onSaveSymptoms={handleSaveSymptoms} onCancelSymptoms={handleCancelSymptoms} onAddSymptom={handleAddSymptom} onSymptomFieldChange={handleSymptomFieldChange} onToggleSymptomStatus={handleToggleSymptomStatus} onSymptomKeyDown={handleSymptomKeyDown} onRemoveSymptom={handleRemoveSymptom} />

                <TreatmentSection patientRecordId={patientRecordId} loading={treatmentLoading} error={treatmentError} plan={treatmentPlan} sections={sections} latest={latestSection} onUpdatePlan={updateTreatmentPlan} onUpdateLatest={updateLatestSection} onCreateSection={createSection} onRefetch={refetchTreatment} />

                <StorageSection />

                {/* <PatientChartsSection series={chartSeries} /> */}
            </div>
        </div>
    )
}
