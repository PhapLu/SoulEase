// PatientsDetail.jsx
import WorkspaceTopBar from "../../../../components/Workspace/WorkspaceTopBar";
import "./patientsDetail.css";
import "../folderClients/folderModelForm/folderModelForm.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiUtils } from "../../../../utils/newRequest";
import { useAuth } from "../../../../contexts/auth/AuthContext";

import PatientsHeader from "./PatientsHeader";
import SymptomsSection from "./SymptomsSection";
import TreatmentSession from "./TreatmentSection/TreatmentSession.jsx";
import StorageSection from "./StorageSection";
import PatientCharts from "./PatientCharts/PatientCharts.jsx";
import Relative from "./Relative/Relative.jsx";
import Breadcrumb from "../../../../components/Breadcrumb/Breadcrumb.jsx";

export default function PatientsDetail() {
    const { patientRecordId } = useParams();

    const { userInfo } = useAuth();
    const isReadOnly = userInfo?.role === "family";

    const normalizeBirthday = (value) => {
        if (!value) return "";
        const d = new Date(value);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
    };

    const calcAge = (birthday) => {
        if (!birthday) return "";
        const birthDate = new Date(birthday);
        if (isNaN(birthDate.getTime())) return "";
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : 0;
    };

    // DATA
    const [patient, setPatient] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const breadcrumbItems = [
        { label: "Workspace", href: "/workspace" },
        patient?.folderId
            ? {
                  label: "Folder",
                  href: `/workspace/patients/folder/${patient.folderId}`,
              }
            : { label: "Folder" },
        {
            label: patient?.fullName,
        },
    ];

    // GLOBAL EDIT MODE
    const [isEditing, setIsEditing] = useState(false);

    // SYMPTOMS EDIT MODE
    const [editingSymptoms, setEditingSymptoms] = useState(false);
    const [originalSymptoms, setOriginalSymptoms] = useState([]);

    const [saving, setSaving] = useState(false);

    // FETCH PATIENT
    useEffect(() => {
        if (!patientRecordId) return;

        const fetchPatient = async () => {
            try {
                const res = await apiUtils.get(`/patientRecord/readPatientRecord/${patientRecordId}`);

                const fetched = res?.data?.metadata?.patientRecord || res?.data?.patientRecord || null;

                if (fetched) {
                    const birthday = normalizeBirthday(fetched.birthday || fetched.dob);
                    const age = calcAge(birthday);
                    const normalized = {
                        ...fetched,
                        birthday,
                        age,
                        symptoms: fetched.symptoms ? [...fetched.symptoms] : [],
                    };
                    setPatient(normalized);
                    setEditForm(normalized);
                } else {
                    setPatient(null);
                    setEditForm(null);
                }
            } catch (err) {
                console.error("Failed to fetch patient record", err);
            }
        };

        fetchPatient();
    }, [patientRecordId]);

    // UNIFIED SAVE FUNCTION
    const persistRecord = async (newForm) => {
        if (isReadOnly) throw new Error("Read-only access");
        const recordId = newForm?.recordId || patient?.recordId;
        if (!recordId) throw new Error("Missing recordId");

        await apiUtils.patch(`/patientRecord/updatePatientRecord/${recordId}`, newForm);
        setPatient(newForm);
    };

    // ------- GLOBAL EDIT --------
    const handleStartEdit = () => {
        if (isReadOnly) return;
        setEditForm(patient ? { ...patient } : {});
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (isReadOnly) return;
        setEditForm(patient ? { ...patient } : {});
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        if (isReadOnly) return;
        setSaving(true);
        try {
            await persistRecord(editForm);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    const handleFieldChange = (field, value) => {
        if (isReadOnly) return;
        if (field === "phone") {
            const digits = String(value || "")
                .replace(/\D+/g, "")
                .slice(0, 10);
            setEditForm((prev) => ({ ...prev, phone: digits }));
            return;
        }
        if (field === "gender") {
            const g = String(value || "").toLowerCase();
            setEditForm((prev) => ({ ...prev, gender: g }));
            return;
        }
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    // Auto-calc age from birthday
    useEffect(() => {
        if (!editForm) return;
        const b = editForm.birthday;
        if (!b) {
            setEditForm((prev) => ({ ...prev, age: "" }));
            return;
        }
        const age = calcAge(b);
        setEditForm((prev) => ({ ...prev, age }));
    }, [editForm?.birthday]);

    // ------- RELATIVE SECTION -------
    const fetchPatient = async () => {
        try {
            const res = await apiUtils.get(`/patientRecord/readPatientRecord/${patientRecordId}`);

            const fetched = res?.data?.metadata?.patientRecord || res?.data?.patientRecord || null;

            if (fetched) {
                const birthday = normalizeBirthday(fetched.birthday || fetched.dob);
                const age = calcAge(birthday);
                const recordId = fetched.recordId || fetched._id;
                let relatives = fetched.relatives || fetched.caregivers || [];

                if (recordId) {
                    try {
                        const relRes = await apiUtils.get(`/relative/readRelatives/${recordId}`);
                        relatives = relRes?.data?.metadata?.relatives || relRes?.data?.relatives || relatives;
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
                };
                setPatient(normalized);
                setEditForm(normalized);
            } else {
                setPatient(null);
                setEditForm(null);
            }
        } catch (err) {
            console.error("Failed to fetch patient record", err);
        }
    };

    useEffect(() => {
        if (!patientRecordId) return;
        fetchPatient();
    }, [patientRecordId]);

    const handleCreateRelative = async (payload) => {
        if (isReadOnly) return;
        try {
            const recordId = editForm?.recordId || patient?.recordId;
            await apiUtils.post("/relative/createRelativeAccount", {
                recordId,
                patientRecordId,
                ...payload,
            });

            await fetchPatient();
        } catch (err) {
            console.error("Failed to create relative", err);
        }
    };

    // -------- SYMPTOMS EDIT -------
    const handleEditSymptoms = () => {
        if (isReadOnly) return;
        setOriginalSymptoms(editForm?.symptoms || []);
        setEditingSymptoms(true);
    };

    const handleCancelSymptoms = () => {
        if (isReadOnly) return;
        setEditForm((prev) => ({
            ...prev,
            symptoms: [...originalSymptoms],
        }));
        setEditingSymptoms(false);
    };

    const handleSaveSymptoms = async () => {
        if (isReadOnly) return;
        setSaving(true);
        try {
            const cleanedSymptoms = (editForm?.symptoms || [])
                .map((s) => ({
                    ...s,
                    name: (s.name || "").trim(),
                    sign: (s.sign || "").trim(),
                }))
                .filter((s) => s.name || s.sign);

            const updated = { ...editForm, symptoms: cleanedSymptoms };
            setEditForm(updated);

            await persistRecord(updated);
            setEditingSymptoms(false);
            setOriginalSymptoms(cleanedSymptoms);
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    const handleAddSymptom = () => {
        if (isReadOnly) return;
        setEditForm((prev) => ({
            ...prev,
            symptoms: [
                ...prev.symptoms,
                {
                    id: `tmp-${Date.now()}`,
                    name: "",
                    sign: "",
                    date: new Date().toISOString().split("T")[0],
                    status: "Active",
                },
            ],
        }));

        setTimeout(() => {
            const inputs = document.querySelectorAll(".pd-input--symptom");
            inputs[inputs.length - 2]?.focus();
        }, 50);
    };

    const handleSymptomFieldChange = (index, field, value) => {
        if (isReadOnly) return;
        setEditForm((prev) => {
            const list = [...prev.symptoms];
            list[index][field] = value;
            return { ...prev, symptoms: list };
        });
    };

    const handleToggleSymptomStatus = async (index) => {
        if (isReadOnly) return;
        const list =
            editForm?.symptoms?.map((sym, i) =>
                i === index
                    ? {
                          ...sym,
                          status: sym.status === "Resolved" ? "Active" : "Resolved",
                      }
                    : sym
            ) || [];

        const updated = { ...editForm, symptoms: list };
        setEditForm(updated);

        if (!editingSymptoms) {
            setSaving(true);
            try {
                await persistRecord(updated);
            } catch (err) {
                console.error(err);
            }
            setSaving(false);
        }
    };

    const handleSymptomKeyDown = async (e, index) => {
        if (isReadOnly) return;
        if (e.key !== "Enter") return;
        e.preventDefault();

        const updated = { ...editForm, symptoms: [...editForm.symptoms] };
        updated.symptoms[index].name = updated.symptoms[index].name.trim();
        updated.symptoms[index].sign = updated.symptoms[index].sign.trim();

        setEditForm(updated);
        await persistRecord(updated);

        // Auto-add new row
        handleAddSymptom();
    };

    const handleRemoveSymptom = async (index) => {
        if (isReadOnly) return;
        const updated = {
            ...editForm,
            symptoms: editForm.symptoms.filter((_, i) => i !== index),
        };

        setEditForm(updated);
        await persistRecord(updated);
    };

    const handleTogglePresetSymptom = async (preset, checked) => {
        if (isReadOnly) return;
        const normName = (preset.name || "").trim();
        const normSign = (preset.sign || "").trim();
        const today = new Date().toISOString().split("T")[0];

        const list = [...(editForm?.symptoms || [])];
        const idx = list.findIndex((s) => (s.name || "").trim().toLowerCase() === normName.toLowerCase() && (s.sign || "").trim().toLowerCase() === normSign.toLowerCase());

        if (checked && idx === -1) {
            list.push({
                id: preset.id || `sym-${Date.now()}`,
                name: normName || preset.sign || "Symptom",
                sign: normSign,
                date: preset.date || today,
                status: preset.status || "Active",
            });
        } else if (!checked && idx !== -1) {
            list.splice(idx, 1);
        } else {
            return;
        }

        const updated = { ...editForm, symptoms: list };
        setEditForm(updated);
        setSaving(true);
        try {
            await persistRecord(updated);
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    if (!editForm) return <div>Loading...</div>;

    // treatment sessions sorted by date desc (latest first)
    const sessions = (Array.isArray(editForm?.treatmentSections) && [...editForm.treatmentSections]) || (Array.isArray(editForm?.treatmentSessions) && [...editForm.treatmentSessions]) || [];
    sessions.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const latestSession = sessions[0] || null;

    return (
        <div className="pd-page">
            <WorkspaceTopBar />

            <div className="pd-inner">
                <div className="breadcrumb">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <PatientsHeader patient={patient} editForm={editForm} isEditing={isEditing} readOnly={isReadOnly} saving={saving} onFieldChange={handleFieldChange} onStartEdit={handleStartEdit} onSaveEdit={handleSaveEdit} onCancelEdit={handleCancelEdit} />

                <Relative relatives={editForm?.relatives || editForm?.caregivers || []} readOnly={isReadOnly} onCreateRelative={handleCreateRelative} />

                {/* ChartSection */}
                <PatientCharts patientData={patient} />

                <SymptomsSection symptoms={editForm.symptoms || []} editingSymptoms={editingSymptoms} setEditingSymptoms={setEditingSymptoms} readOnly={isReadOnly} onSaveSymptoms={handleSaveSymptoms} onCancelSymptoms={handleCancelSymptoms} onAddSymptom={handleAddSymptom} onSymptomFieldChange={handleSymptomFieldChange} onToggleSymptomStatus={handleToggleSymptomStatus} onSymptomKeyDown={handleSymptomKeyDown} onRemoveSymptom={handleRemoveSymptom} onTogglePresetSymptom={handleTogglePresetSymptom} />

                <TreatmentSession patientRecordId={patientRecordId} sessions={sessions} latest={latestSession} readOnly={isReadOnly} onStartEdit={handleStartEdit} />

                <StorageSection />
            </div>
        </div>
    );
}
