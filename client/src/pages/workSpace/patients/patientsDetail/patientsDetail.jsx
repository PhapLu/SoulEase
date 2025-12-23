// PatientsDetail.jsx
import WorkspaceTopBar from "../../../../components/Workspace/WorkspaceTopBar";
import "./patientsDetail.css";
import "../folderClients/folderModelForm/folderModelForm.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiUtils } from "../../../../utils/newRequest";

import PatientsHeader from "./PatientsHeader";
import SymptomsSection from "./SymptomsSection";
import TreatmentSession from "./TreatmentSection/TreatmentSession.jsx";
import StorageSection from "./StorageSection";
import PatientCharts from "./PatientCharts";

export default function PatientsDetail() {
    const { patientRecordId } = useParams();

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
                const res = await apiUtils.get(
                    `/patientRecord/readPatientRecord/${patientRecordId}`
                );

                const fetched =
                    res?.data?.metadata?.patientRecord ||
                    res?.data?.patientRecord ||
                    null;

                if (fetched) {
                    const birthday = normalizeBirthday(
                        fetched.birthday || fetched.dob
                    );
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
        const recordId = newForm?.recordId || patient?.recordId;
        if (!recordId) throw new Error("Missing recordId");

        await apiUtils.patch(
            `/patientRecord/updatePatientRecord/${recordId}`,
            newForm
        );
        setPatient(newForm);
    };

    // ------- GLOBAL EDIT --------
    const handleStartEdit = () => {
        setEditForm(patient ? { ...patient } : {});
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditForm(patient ? { ...patient } : {});
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
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

    // -------- SYMPTOMS EDIT -------
    const handleEditSymptoms = () => {
        setOriginalSymptoms(editForm?.symptoms || []);
        setEditingSymptoms(true);
    };

    const handleCancelSymptoms = () => {
        setEditForm((prev) => ({
            ...prev,
            symptoms: [...originalSymptoms],
        }));
        setEditingSymptoms(false);
    };

    const handleSaveSymptoms = async () => {
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
        setEditForm((prev) => {
            const list = [...prev.symptoms];
            list[index][field] = value;
            return { ...prev, symptoms: list };
        });
    };

    const handleToggleSymptomStatus = async (index) => {
        const list =
            editForm?.symptoms?.map((sym, i) =>
                i === index
                    ? {
                          ...sym,
                          status:
                              sym.status === "Resolved" ? "Active" : "Resolved",
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
        const updated = {
            ...editForm,
            symptoms: editForm.symptoms.filter((_, i) => i !== index),
        };

        setEditForm(updated);
        await persistRecord(updated);
    };

    if (!editForm) return <div>Loading...</div>;

    // treatment sessions sorted by date desc (latest first)
    const sessions =
        (Array.isArray(editForm?.treatmentSections) && [...editForm.treatmentSections]) ||
        (Array.isArray(editForm?.treatmentSessions) && [...editForm.treatmentSessions]) ||
        [];
    sessions.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const latestSession = sessions[0] || null;

    return (
        <div className="pd-page">
            <WorkspaceTopBar />

            <div className="pd-inner">
                <PatientsHeader
                    patient={patient}
                    editForm={editForm}
                    isEditing={isEditing}
                    saving={saving}
                    onFieldChange={handleFieldChange}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                />

                {/* ChartSection */}
                <PatientCharts patientData={patient} />


                <SymptomsSection
                    symptoms={editForm.symptoms || []}
                    editingSymptoms={editingSymptoms}
                    setEditingSymptoms={setEditingSymptoms}
                    onSaveSymptoms={handleSaveSymptoms}
                    onCancelSymptoms={handleCancelSymptoms}
                    onAddSymptom={handleAddSymptom}
                    onSymptomFieldChange={handleSymptomFieldChange}
                    onToggleSymptomStatus={handleToggleSymptomStatus}
                    onSymptomKeyDown={handleSymptomKeyDown}
                    onRemoveSymptom={handleRemoveSymptom}
                />

                <TreatmentSession
                    patientRecordId={patientRecordId}
                    sessions={sessions}
                    latest={latestSession}
                    onStartEdit={handleStartEdit}
                />

                <StorageSection />

                
            </div>
        </div>
    );
}
