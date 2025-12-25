// PatientsProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiUtils } from "../../../../utils/newRequest";
import "./patientsProfile.css";

const ROLE_TABS = [
    { key: "patient", label: "Patient" },
    { key: "relative", label: "Relative" },
    { key: "doctor", label: "Doctor" },
    { key: "nurse", label: "Nurse" },
];

const pick = (obj, path, fallback = "") => {
    try {
        return (
            path
                .split(".")
                .reduce((acc, k) => (acc ? acc[k] : undefined), obj) ?? fallback
        );
    } catch {
        return fallback;
    }
};

export default function PatientsProfilePage() {
    const { patientRecordId } = useParams();

    const [activeRole, setActiveRole] = useState("patient");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [record, setRecord] = useState(null);

    const [drafts, setDrafts] = useState({
        patient: emptyDraft(),
        relative: emptyDraft(),
        doctor: emptyDraft(),
        nurse: emptyDraft(),
    });

    function emptyDraft() {
        return {
            fullName: "",
            dob: "",
            gender: "",
            phone: "",
            email: "",
            address: "",
            relationship: "",
            specialty: "",
            department: "",
            note: "",
        };
    }

    const hydrateDraftsFromRecord = (rec) => {
        const patientSrc =
            rec?.patient ||
            rec?.patientInfo ||
            rec?.patientProfile ||
            rec ||
            {};
        const relativeSrc =
            rec?.relative || rec?.relativeInfo || rec?.relativeProfile || {};
        const doctorSrc =
            rec?.doctor || rec?.doctorInfo || rec?.doctorProfile || {};
        const nurseSrc =
            rec?.nurse || rec?.nurseInfo || rec?.nurseProfile || {};

        return {
            patient: {
                fullName: pick(
                    patientSrc,
                    "fullName",
                    pick(patientSrc, "name", "")
                ),
                dob: pick(
                    patientSrc,
                    "dob",
                    pick(patientSrc, "dateOfBirth", "")
                ),
                gender: pick(patientSrc, "gender", ""),
                phone: pick(patientSrc, "phone", ""),
                email: pick(patientSrc, "email", ""),
                address: pick(patientSrc, "address", ""),
                relationship: "",
                specialty: "",
                department: "",
                note: pick(patientSrc, "note", ""),
            },
            relative: {
                fullName: pick(
                    relativeSrc,
                    "fullName",
                    pick(relativeSrc, "name", "")
                ),
                dob: pick(
                    relativeSrc,
                    "dob",
                    pick(relativeSrc, "dateOfBirth", "")
                ),
                gender: pick(relativeSrc, "gender", ""),
                phone: pick(relativeSrc, "phone", ""),
                email: pick(relativeSrc, "email", ""),
                address: pick(relativeSrc, "address", ""),
                relationship: pick(
                    relativeSrc,
                    "relationship",
                    pick(relativeSrc, "relation", "")
                ),
                specialty: "",
                department: "",
                note: pick(relativeSrc, "note", ""),
            },
            doctor: {
                fullName: pick(
                    doctorSrc,
                    "fullName",
                    pick(doctorSrc, "name", "")
                ),
                dob: pick(doctorSrc, "dob", pick(doctorSrc, "dateOfBirth", "")),
                gender: pick(doctorSrc, "gender", ""),
                phone: pick(doctorSrc, "phone", ""),
                email: pick(doctorSrc, "email", ""),
                address: pick(doctorSrc, "address", ""),
                relationship: "",
                specialty: pick(doctorSrc, "specialty", ""),
                department: pick(doctorSrc, "department", ""),
                note: pick(doctorSrc, "note", ""),
            },
            nurse: {
                fullName: pick(
                    nurseSrc,
                    "fullName",
                    pick(nurseSrc, "name", "")
                ),
                dob: pick(nurseSrc, "dob", pick(nurseSrc, "dateOfBirth", "")),
                gender: pick(nurseSrc, "gender", ""),
                phone: pick(nurseSrc, "phone", ""),
                email: pick(nurseSrc, "email", ""),
                address: pick(nurseSrc, "address", ""),
                relationship: "",
                specialty: pick(nurseSrc, "specialty", ""),
                department: pick(nurseSrc, "department", ""),
                note: pick(nurseSrc, "note", ""),
            },
        };
    };

    const refetch = async () => {
        if (!patientRecordId) return;
        setLoading(true);
        setError("");
        try {
            const res = await apiUtils.get(
                `/patientRecord/readPatientRecord/${patientRecordId}`
            );
            const fetched =
                res?.data?.metadata?.patientRecord ||
                res?.data?.patientRecord ||
                null;
            setRecord(fetched);
            setDrafts(hydrateDraftsFromRecord(fetched || {}));
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e?.message ||
                    "Failed to load profile"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientRecordId]);

    const activeDraft = drafts[activeRole];

    const roleTitle = useMemo(() => {
        const found = ROLE_TABS.find((t) => t.key === activeRole);
        return found?.label || "Profile";
    }, [activeRole]);

    const onChange = (key, value) => {
        setDrafts((p) => ({
            ...p,
            [activeRole]: {
                ...p[activeRole],
                [key]: value,
            },
        }));
    };

    const onCancel = () => {
        if (!record) return;
        setDrafts(hydrateDraftsFromRecord(record));
        setError("");
    };

    const onSave = async (e) => {
        e.preventDefault();
        if (!record) return;

        const recordId = record.recordId || record._id;
        if (!recordId) {
            setError("Missing recordId");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = {
                [activeRole]: {
                    fullName: activeDraft.fullName?.trim(),
                    dob: activeDraft.dob || "",
                    gender: activeDraft.gender || "",
                    phone: activeDraft.phone?.trim(),
                    email: activeDraft.email?.trim(),
                    address: activeDraft.address?.trim(),
                    ...(activeRole === "relative"
                        ? { relationship: activeDraft.relationship?.trim() }
                        : {}),
                    ...(activeRole === "doctor" || activeRole === "nurse"
                        ? {
                              specialty: activeDraft.specialty?.trim(),
                              department: activeDraft.department?.trim(),
                          }
                        : {}),
                    note: activeDraft.note || "",
                },
            };

            await apiUtils.patch(
                `/patientRecord/updatePatientRecord/${recordId}`,
                payload
            );

            await refetch();
        } catch (e2) {
            setError(
                e2?.response?.data?.message || e2?.message || "Save failed"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="pp-page">
            <div className="pp-header">
                <div>
                    <h3 className="pp-title">Profiles</h3>
                    <div className="pp-subtitle">
                        Edit personal information for patient, relative, doctor,
                        and nurse.
                    </div>
                </div>

                <div
                    className="pp-tabs"
                    role="tablist"
                    aria-label="Profile roles"
                >
                    {ROLE_TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            className={`pp-tab ${
                                activeRole === t.key ? "pp-tab--active" : ""
                            }`}
                            onClick={() => setActiveRole(t.key)}
                            role="tab"
                            aria-selected={activeRole === t.key}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {error ? <div className="pp-error">{error}</div> : null}

            {loading ? (
                <div className="pp-card">Loading...</div>
            ) : (
                <section className="pp-card">
                    <div className="pp-card__top">
                        <div>
                            <div className="pp-kicker">{roleTitle}</div>
                            <div className="pp-card__title">
                                Personal information
                            </div>
                        </div>
                    </div>

                    <form className="pp-form" onSubmit={onSave}>
                        <div className="pp-grid">
                            <label className="pp-field">
                                <div className="pp-label">Full name</div>
                                <input
                                    className="pp-input"
                                    value={activeDraft.fullName}
                                    onChange={(e) =>
                                        onChange("fullName", e.target.value)
                                    }
                                />
                            </label>

                            <label className="pp-field">
                                <div className="pp-label">Date of birth</div>
                                <input
                                    className="pp-input"
                                    type="date"
                                    value={activeDraft.dob}
                                    onChange={(e) =>
                                        onChange("dob", e.target.value)
                                    }
                                />
                            </label>

                            <label className="pp-field">
                                <div className="pp-label">Gender</div>
                                <select
                                    className="pp-input"
                                    value={activeDraft.gender}
                                    onChange={(e) =>
                                        onChange("gender", e.target.value)
                                    }
                                >
                                    <option value="">—</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </label>

                            <label className="pp-field">
                                <div className="pp-label">Phone</div>
                                <input
                                    className="pp-input"
                                    value={activeDraft.phone}
                                    onChange={(e) =>
                                        onChange("phone", e.target.value)
                                    }
                                />
                            </label>

                            <label className="pp-field">
                                <div className="pp-label">Email</div>
                                <input
                                    className="pp-input"
                                    type="email"
                                    value={activeDraft.email}
                                    onChange={(e) =>
                                        onChange("email", e.target.value)
                                    }
                                />
                            </label>

                            <label className="pp-field">
                                <div className="pp-label">Address</div>
                                <input
                                    className="pp-input"
                                    value={activeDraft.address}
                                    onChange={(e) =>
                                        onChange("address", e.target.value)
                                    }
                                />
                            </label>

                            {activeRole === "relative" ? (
                                <label className="pp-field pp-field--span2">
                                    <div className="pp-label">
                                        Relationship to patient
                                    </div>
                                    <input
                                        className="pp-input"
                                        value={activeDraft.relationship}
                                        onChange={(e) =>
                                            onChange(
                                                "relationship",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Mother, Father, Spouse..."
                                    />
                                </label>
                            ) : null}

                            {activeRole === "doctor" ||
                            activeRole === "nurse" ? (
                                <>
                                    <label className="pp-field">
                                        <div className="pp-label">
                                            Specialty
                                        </div>
                                        <input
                                            className="pp-input"
                                            value={activeDraft.specialty}
                                            onChange={(e) =>
                                                onChange(
                                                    "specialty",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. Psychiatry"
                                        />
                                    </label>

                                    <label className="pp-field">
                                        <div className="pp-label">
                                            Department
                                        </div>
                                        <input
                                            className="pp-input"
                                            value={activeDraft.department}
                                            onChange={(e) =>
                                                onChange(
                                                    "department",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. Mental Health"
                                        />
                                    </label>
                                </>
                            ) : null}

                            <label className="pp-field pp-field--span2">
                                <div className="pp-label">Notes</div>
                                <textarea
                                    className="pp-input pp-textarea"
                                    rows={5}
                                    value={activeDraft.note}
                                    onChange={(e) =>
                                        onChange("note", e.target.value)
                                    }
                                />
                            </label>
                        </div>

                        <div className="pp-actions">
                            <button
                                type="button"
                                className="pp-btn pp-btn--ghost"
                                onClick={onCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="pp-btn"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
}
