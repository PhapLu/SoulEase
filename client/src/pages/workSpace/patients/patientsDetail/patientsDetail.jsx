// PatientsDetail.jsx
import WorkspaceTopBar from '../../../../components/Workspace/WorkspaceTopBar'
import './patientsDetail.css'
import '../folderClients/folderModelForm/folderModelForm.css'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiUtils } from '../../../../utils/newRequest'
import { useAuth } from '../../../../contexts/auth/AuthContext'

import PatientsHeader from './PatientsHeader'
import SymptomsSection from './SymptomsSection'
import TreatmentSession from './TreatmentSection/TreatmentSession.jsx'
import StorageSection from './StorageSection/StorageSection.jsx'
import PatientCharts from './PatientCharts/PatientCharts.jsx'
import Relative from './Relative/Relative.jsx'
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb.jsx'

export default function PatientsDetail() {
    const { patientRecordId } = useParams()

    const { userInfo } = useAuth()
    const isSectionReadOnly = userInfo?.role === 'family' || userInfo?.role === 'member'

    const normalizeBirthday = (value) => {
        if (!value) return ''
        const d = new Date(value)
        if (isNaN(d.getTime())) return ''
        return d.toISOString().split('T')[0]
    }

    const calcAge = (birthday) => {
        if (!birthday) return ''
        const birthDate = new Date(birthday)
        if (isNaN(birthDate.getTime())) return ''
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age >= 0 ? age : 0
    }

    // DATA
    const [patient, setPatient] = useState(null)
    const [editForm, setEditForm] = useState(null)

    const breadcrumbItems = [
        { label: 'Workspace', href: '/workspace' },
        patient?.folderId
            ? {
                  label: 'Folder',
                  href: `/workspace/patients/folder/${patient.folderId}`,
              }
            : { label: 'Folder' },
        {
            label: patient?.fullName,
        },
    ]

    // GLOBAL EDIT MODE
    const [isEditing, setIsEditing] = useState(false)

    // SYMPTOMS EDIT MODE
    const [editingSymptoms, setEditingSymptoms] = useState(false)

    const [saving, setSaving] = useState(false)

    const storageImages = (editForm?.storages || [])
        .filter((s) => s.isImage)
        .map((s) => ({
            _id: s._id, // ✅ add
            url: s.url,
            name: s.name,
            size: s.size,
        }))

    const storageFiles = (editForm?.storages || [])
        .filter((s) => !s.isImage)
        .map((s) => ({
            _id: s._id, // ✅ add
            url: s.url,
            name: s.name,
            size: s.size,
        }))

    // FETCH PATIENT
    useEffect(() => {
        if (!patientRecordId) return

        const fetchPatient = async () => {
            try {
                const res = await apiUtils.get(`/patientRecord/readPatientRecord/${patientRecordId}`)

                const fetched = res?.data?.metadata?.patientRecord || res?.data?.patientRecord || null

                if (fetched) {
                    const birthday = normalizeBirthday(fetched.birthday || fetched.dob)
                    const age = calcAge(birthday)
                    const normalized = {
                        ...fetched,
                        birthday,
                        age,
                        symptoms: fetched.symptoms ? [...fetched.symptoms] : [],
                    }
                    setPatient(normalized)
                    setEditForm(normalized)
                } else {
                    setPatient(null)
                    setEditForm(null)
                }
            } catch (err) {
                console.error('Failed to fetch patient record', err)
            }
        }

        fetchPatient()
    }, [patientRecordId])

    // UNIFIED SAVE FUNCTION
    const persistRecord = async (newForm) => {
        if (isSectionReadOnly) throw new Error('Read-only access')
        const recordId = newForm?.recordId || patient?.recordId
        if (!recordId) throw new Error('Missing recordId')

        await apiUtils.patch(`/patientRecord/updatePatientRecord/${recordId}`, newForm)
        setPatient(newForm)
    }

    // ------- GLOBAL EDIT --------
    const handleStartEdit = () => {
        setEditForm(patient ? { ...patient } : {})
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setEditForm(patient ? { ...patient } : {})
        setIsEditing(false)
    }

    const handleSaveEdit = async () => {
        setSaving(true)
        try {
            if (isSectionReadOnly) {
                const recordId = editForm?.recordId || patient?.recordId
                if (!recordId) throw new Error('Missing recordId')

                const payload = {
                    fullName: editForm?.fullName,
                    phone: editForm?.phone,
                    address: editForm?.address,
                    gender: editForm?.gender,
                    birthday: editForm?.birthday || editForm?.dob,
                }

                await apiUtils.patch(`/patientRecord/updatePatientRecord/${recordId}`, payload)
                const nextAge = calcAge(payload.birthday || patient?.birthday)
                setPatient((prev) => ({ ...prev, ...payload, age: nextAge }))
            } else {
                await persistRecord(editForm)
            }
            setIsEditing(false)
        } catch (err) {
            console.error(err)
        }
        setSaving(false)
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

    // ------- RELATIVE SECTION -------
    const fetchPatient = async () => {
        try {
            const res = await apiUtils.get(`/patientRecord/readPatientRecord/${patientRecordId}`)

            const fetched = res?.data?.metadata?.patientRecord || res?.data?.patientRecord || null

            if (fetched) {
                const birthday = normalizeBirthday(fetched.birthday || fetched.dob)
                const age = calcAge(birthday)
                const recordId = fetched.recordId || fetched._id
                let relatives = fetched.relatives || fetched.caregivers || []

                if (recordId) {
                    try {
                        const relRes = await apiUtils.get(`/relative/readRelatives/${recordId}`)
                        relatives = relRes?.data?.metadata?.relatives || relRes?.data?.relatives || relatives
                    } catch (e) {
                        // keep existing relatives if API not available
                    }
                }
                const normalized = {
                    ...fetched,
                    birthday,
                    age,
                    symptoms: fetched.symptoms ? [...fetched.symptoms] : [],
                    relatives,
                }
                setPatient(normalized)
                setEditForm(normalized)
            } else {
                setPatient(null)
                setEditForm(null)
            }
        } catch (err) {
            console.error('Failed to fetch patient record', err)
        }
    }

    useEffect(() => {
        if (!patientRecordId) return
        fetchPatient()
    }, [patientRecordId])

    const handleCreateRelative = async (payload) => {
        if (isSectionReadOnly) return
        try {
            const recordId = editForm?.recordId || patient?.recordId
            await apiUtils.post('/relative/createRelativeAccount', {
                recordId,
                patientRecordId,
                ...payload,
            })

            await fetchPatient()
        } catch (err) {
            console.error('Failed to create relative', err)
        }
    }

    const handleCancelSymptoms = () => {
        if (isSectionReadOnly) return
        setEditForm((prev) => ({
            ...prev,
            symptoms: [...(patient?.symptoms || [])],
        }))
        setEditingSymptoms(false)
    }

    const handleSaveSymptoms = async () => {
        if (isSectionReadOnly) return
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
        } catch (err) {
            console.error(err)
        }
        setSaving(false)
    }

    const handleAddSymptom = () => {
        if (isSectionReadOnly) return
        setEditForm((prev) => ({
            ...prev,
            symptoms: [
                ...prev.symptoms,
                {
                    id: `tmp-${Date.now()}`,
                    name: '',
                    sign: '',
                    date: new Date().toISOString().split('T')[0],
                    status: 'Active',
                },
            ],
        }))

        setTimeout(() => {
            const inputs = document.querySelectorAll('.pd-input--symptom')
            inputs[inputs.length - 2]?.focus()
        }, 50)
    }

    const handleSymptomFieldChange = (index, field, value) => {
        if (isSectionReadOnly) return
        setEditForm((prev) => {
            const list = [...prev.symptoms]
            list[index][field] = value
            return { ...prev, symptoms: list }
        })
    }

    const handleToggleSymptomStatus = async (index) => {
        if (isSectionReadOnly) return
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
        if (isSectionReadOnly) return
        if (e.key !== 'Enter') return
        e.preventDefault()

        const updated = { ...editForm, symptoms: [...editForm.symptoms] }
        updated.symptoms[index].name = updated.symptoms[index].name.trim()
        updated.symptoms[index].sign = updated.symptoms[index].sign.trim()

        setEditForm(updated)
        await persistRecord(updated)

        // Auto-add new row
        handleAddSymptom()
    }

    const handleRemoveSymptom = async (index) => {
        if (isSectionReadOnly) return
        const updated = {
            ...editForm,
            symptoms: editForm.symptoms.filter((_, i) => i !== index),
        }

        setEditForm(updated)
        await persistRecord(updated)
    }

    const handleTogglePresetSymptom = async (preset, checked) => {
        if (isSectionReadOnly) return
        const normName = (preset.name || '').trim()
        const normSign = (preset.sign || '').trim()
        const today = new Date().toISOString().split('T')[0]

        const list = [...(editForm?.symptoms || [])]
        const idx = list.findIndex((s) => (s.name || '').trim().toLowerCase() === normName.toLowerCase() && (s.sign || '').trim().toLowerCase() === normSign.toLowerCase())

        if (checked && idx === -1) {
            list.push({
                id: preset.id || `sym-${Date.now()}`,
                name: normName || preset.sign || 'Symptom',
                sign: normSign,
                date: preset.date || today,
                status: preset.status || 'Active',
            })
        } else if (!checked && idx !== -1) {
            list.splice(idx, 1)
        } else {
            return
        }

        const updated = { ...editForm, symptoms: list }
        setEditForm(updated)
        setSaving(true)
        try {
            await persistRecord(updated)
        } catch (err) {
            console.error(err)
        }
        setSaving(false)
    }

    // PatientsDetail.jsx
    const handleSaveStorage = async ({ images, files }) => {
        if (isSectionReadOnly) return
        const recordId = patientRecordId
        if (!recordId) return

        // upload images
        for (const img of images) {
            if (!img.file) continue
            const formData = new FormData()
            formData.append('file', img.file)
            await apiUtils.patch(`/patientRecord/uploadFile/${recordId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        }

        // upload files
        for (const f of files) {
            if (!f.file) continue
            const formData = new FormData()
            formData.append('file', f.file)
            await apiUtils.patch(`/patientRecord/uploadFile/${recordId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        }

        // ❌ REMOVE: await fetchPatient()
    }

    if (!editForm) return <div>Loading...</div>

    // treatment sessions sorted by date desc (latest first)
    const sessions = (Array.isArray(editForm?.treatmentSections) && [...editForm.treatmentSections]) || (Array.isArray(editForm?.treatmentSessions) && [...editForm.treatmentSessions]) || []
    sessions.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    const latestSession = sessions[0] || null

    return (
        <div className='pd-page'>
            <WorkspaceTopBar />

            <div className='pd-inner'>
                <div className='breadcrumb'>
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <PatientsHeader patient={patient} editForm={editForm} isEditing={isEditing} readOnly={false} canEdit={true} showImport={!isSectionReadOnly} saving={saving} onFieldChange={handleFieldChange} onStartEdit={handleStartEdit} onSaveEdit={handleSaveEdit} onCancelEdit={handleCancelEdit} />

                <Relative relatives={editForm?.relatives || editForm?.caregivers || []} readOnly={isSectionReadOnly} onCreateRelative={handleCreateRelative} />

                {/* ChartSection */}
                <PatientCharts patientData={patient} />

                <SymptomsSection symptoms={editForm.symptoms || []} editingSymptoms={editingSymptoms} setEditingSymptoms={setEditingSymptoms} readOnly={isSectionReadOnly} onSaveSymptoms={handleSaveSymptoms} onCancelSymptoms={handleCancelSymptoms} onAddSymptom={handleAddSymptom} onSymptomFieldChange={handleSymptomFieldChange} onToggleSymptomStatus={handleToggleSymptomStatus} onSymptomKeyDown={handleSymptomKeyDown} onRemoveSymptom={handleRemoveSymptom} onTogglePresetSymptom={handleTogglePresetSymptom} />

                <TreatmentSession patientRecordId={patientRecordId} folderId={editForm?.folderId || patient?.folderId} sessions={sessions} latest={latestSession} readOnly={isSectionReadOnly} onStartEdit={handleStartEdit} />

                <StorageSection
                    patientRecordId={patientRecordId} // ✅ add this
                    readOnly={isSectionReadOnly}
                    initialImages={storageImages}
                    initialFiles={storageFiles}
                    onSave={handleSaveStorage}
                    onRefresh={fetchPatient}
                />
            </div>
        </div>
    )
}
