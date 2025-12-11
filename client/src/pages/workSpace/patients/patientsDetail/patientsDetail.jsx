// PatientsDetail.jsx
import WorkspaceTopBar from "../../../../components/Workspace/WorkspaceTopBar";
import "./patientsDetail.css";
import "../folderClients/folderModelForm/folderModelForm.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiUtils } from "../../../../utils/newRequest";

import PatientsHeader from "./PatientsHeader";
import SymptomsSection from "./SymptomsSection";
import TreatmentSection from "./TreatmentSection";
import StorageSection from "./StorageSection";
import { chartSeries } from "./PatientCharts";

export default function PatientsDetail() {
    const { patientRecordId } = useParams();

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

                setPatient(fetched);
                setEditForm(
                    fetched
                        ? {
                              ...fetched,
                              symptoms: fetched.symptoms
                                  ? [...fetched.symptoms]
                                  : [],
                          }
                        : null
                );
            } catch (err) {
                console.error("Failed to fetch patient record", err);
            }
        };

        fetchPatient();
    }, [patientRecordId]);

    // UNIFIED SAVE FUNCTION
    const persistRecord = async (newForm) => {
        await apiUtils.put(
            `/patientRecord/updatePatientRecord/${patientRecordId}`,
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
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

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
            await persistRecord(editForm);
            setEditingSymptoms(false);
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
                { id: `tmp-${Date.now()}`, name: "", sign: "" },
            ],
        }));

        setTimeout(() => {
            const inputs = document.querySelectorAll(".pd-input--symptom");
            inputs[inputs.length - 2]?.focus();
        }, 50);
    };

    const handleSymptomChange = (index, value) => {
        setEditForm((prev) => {
            const list = [...prev.symptoms];
            list[index].text = value;
            return { ...prev, symptoms: list };
        });
    };

    // giữ luôn biến này cho đúng với code cũ, dù đang chưa dùng
    let symptomSaveTimer = null;

    const handleSymptomFieldChange = (index, field, value) => {
        setEditForm((prev) => {
            const list = [...prev.symptoms];
            list[index][field] = value;
            return { ...prev, symptoms: list };
        });
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

                <SymptomsSection
                    symptoms={editForm.symptoms || []}
                    editingSymptoms={editingSymptoms}
                    setEditingSymptoms={setEditingSymptoms}
                    onSaveSymptoms={handleSaveSymptoms}
                    onCancelSymptoms={handleCancelSymptoms}
                    onAddSymptom={handleAddSymptom}
                    onSymptomFieldChange={handleSymptomFieldChange}
                    onSymptomKeyDown={handleSymptomKeyDown}
                    onRemoveSymptom={handleRemoveSymptom}
                />

                <TreatmentSection onStartEdit={handleStartEdit} />

                <StorageSection />

                {/* <PatientChartsSection series={chartSeries} /> */}
            </div>
        </div>
    );
}
