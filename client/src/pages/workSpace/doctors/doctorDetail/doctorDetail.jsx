import { useEffect, useState } from "react";
import WorkspaceTopBar from "../../../../components/Workspace/WorkspaceTopBar";
import "./doctorDetail.css";
import { useParams } from "react-router-dom";
import { apiUtils } from "../../../../utils/newRequest";
import { EditIcon, RemoveIcon, AddIcon } from "../../Icon";

const LANG_OPTIONS = [
    "English",
    "Vietnamese",
    "Spanish",
    "French",
    "Chinese",
    "Other",
];

export default function DoctorDetail() {
    const { doctorId } = useParams();

    const [doctor, setDoctor] = useState(null); // original fetched
    const [editForm, setEditForm] = useState(null); // editable copy
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // fetch doctor
    useEffect(() => {
        const fetchDoctorDetail = async () => {
            try {
                const res = await apiUtils.get(
                    `/user/readDoctorDetail/${doctorId}`
                );
                const data =
                    res?.data?.metadata?.user || res?.data?.user || null;
                console.log(data);
                // normalize language to array for editForm
                const langArr = data?.language
                    ? String(data.language)
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [];

                // if backend stored "Dr. Name" we strip prefix for editForm.fullName
                const rawName = data?.fullName ? String(data.fullName) : "";
                const strippedName = rawName.startsWith("Dr. ")
                    ? rawName.slice(4)
                    : rawName;

                const normalized = {
                    ...data,
                    fullName: strippedName,
                    language: langArr,
                };

                setDoctor(data || {});
                setEditForm(normalized || {});
            } catch (err) {
                console.error("fetch doctor fail", err);
            }
        };

        fetchDoctorDetail();
    }, [doctorId]);

    // compute age from birthday whenever birthday changes
    useEffect(() => {
        if (!editForm) return;
        const b = editForm.birthday;
        if (!b) {
            setEditForm((prev) => ({ ...prev, age: prev.age ?? "" }));
            return;
        }
        // assume birthday in format YYYY-MM-DD (HTML date input)
        const birthDate = new Date(b);
        if (isNaN(birthDate.getTime())) return;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        setEditForm((prev) => ({ ...prev, age: age >= 0 ? age : 0 }));
    }, [editForm?.birthday]);

    // basic validation (phone only digits, length 10)
    const validate = (form) => {
        const e = {};
        const phone = String(form?.phone || "");
        if (phone && !/^\d{10}$/.test(phone)) {
            e.phone = "Phone must be exactly 10 digits.";
        }
        const exp = form?.experience;
        if (
            exp !== undefined &&
            exp !== "" &&
            (!Number.isFinite(Number(exp)) || Number(exp) < 0)
        ) {
            e.experience = "Experience must be a non-negative number.";
        }
        // optional: require fullName
        if (!form?.fullName || !String(form.fullName).trim()) {
            e.fullName = "Name is required.";
        }
        return e;
    };

    // handlers
    const handleStartEdit = () => {
        // ensure editForm exists
        if (!editForm && doctor) {
            // initialize from doctor
            const langArr = doctor?.language
                ? String(doctor.language)
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                : [];
            const rawName = doctor?.fullName ? String(doctor.fullName) : "";
            const strippedName = rawName.startsWith("Dr. ")
                ? rawName.slice(4)
                : rawName;
            setEditForm({
                ...doctor,
                fullName: strippedName,
                language: langArr,
            });
        }
        setIsEditing(true);
        setErrors({});
    };

    const handleCancel = () => {
        // revert to original fetched doctor (strip Dr. prefix again)
        if (doctor) {
            const langArr = doctor?.language
                ? String(doctor.language)
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                : [];
            const rawName = doctor?.fullName ? String(doctor.fullName) : "";
            const strippedName = rawName.startsWith("Dr. ")
                ? rawName.slice(4)
                : rawName;
            setEditForm({
                ...doctor,
                fullName: strippedName,
                language: langArr,
            });
        }
        setErrors({});
        setIsEditing(false);
    };

    const handleSave = async () => {
        const e = validate(editForm || {});
        setErrors(e);
        if (Object.keys(e).length) return;

        setSaving(true);
        try {
            // prepare payload: fullName without Dr. prefix (backend may expect fullName only)
            const payload = {
                ...editForm,
                fullName: String(editForm?.fullName || "").trim(),
                // send language as string like "English, Spanish" (keep backward compatibility)
                language: (editForm?.language || []).join(", "),
            };
            // convert numeric fields
            if (payload.experience !== undefined && payload.experience !== "") {
                payload.experience = Number(payload.experience);
            }
            if (payload.age !== undefined && payload.age !== "") {
                payload.age = Number(payload.age);
            }

            await apiUtils.put(`/user/updateDoctor/${doctorId}`, payload);
            // update local original
            setDoctor(payload);
            // reflect editForm: keep language as array for UI edit
            setEditForm((prev) => ({
                ...payload,
                language: prev.language || [],
            }));
            setIsEditing(false);
        } catch (err) {
            console.error("save doctor fail", err);
        } finally {
            setSaving(false);
        }
    };

    // generic field change
    const handleFieldChange = (field, value) => {
        // phone: strip non-digits and limit to 10
        if (field === "phone") {
            const digits = String(value || "")
                .replace(/\D+/g, "")
                .slice(0, 10);
            setEditForm((prev) => ({ ...prev, phone: digits }));
            // update error live
            setErrors((prev) => {
                const copy = { ...prev };
                if (!/^\d{10}$/.test(digits))
                    copy.phone = "Phone must be exactly 10 digits.";
                else delete copy.phone;
                return copy;
            });
            return;
        }

        // experience: allow only digits (and empty)
        if (field === "experience") {
            // allow numbers only (including empty)
            const filtered = String(value).replace(/[^\d]/g, "");
            setEditForm((prev) => ({ ...prev, experience: filtered }));
            setErrors((prev) => {
                const copy = { ...prev };
                if (
                    filtered !== "" &&
                    (!Number.isFinite(Number(filtered)) || Number(filtered) < 0)
                )
                    copy.experience =
                        "Experience must be a non-negative number.";
                else delete copy.experience;
                return copy;
            });
            return;
        }

        // birthday: set directly (age computed by effect)
        if (field === "birthday") {
            setEditForm((prev) => ({ ...prev, birthday: value }));
            return;
        }

        // language handled separately
        setEditForm((prev) => ({ ...prev, [field]: value }));
        // clear specific field error if any
        setErrors((prev) => {
            const c = { ...prev };
            delete c[field];
            return c;
        });
    };

    // name input should store without "Dr. " prefix — if user pastes with Dr. remove it
    const handleNameChange = (value) => {
        const stripped = String(value || "").replace(/^Dr\.\s*/i, "");
        handleFieldChange("fullName", stripped);
    };

    // language multi-select change (native multiple select)
    const handleLanguageChange = (selectedOptions) => {
        // selectedOptions: HTMLCollection from event.target.selectedOptions
        const arr = Array.from(selectedOptions).map((o) => o.value);
        setEditForm((prev) => ({ ...prev, language: arr }));
    };

    // display name with Dr. prefix always
    const displayName = `Dr. ${String(
        editForm?.fullName || doctor?.fullName || ""
    ).trim()}`;

    return (
        <div className="dd-page">
            <WorkspaceTopBar />

            <div className="dd-inner">
                <section className="dd-header">
                    <img className='dd-avatar' src={doctor?.avatar} alt={doctor?.fullName} />


                    <div className="dd-info">
                        <div className="dd-info__row">
                            <h2>
                                {isEditing ? (
                                    <input
                                        className="pd-input pd-input--title"
                                        value={editForm?.fullName || ""}
                                        onChange={(e) =>
                                            handleNameChange(e.target.value)
                                        }
                                        placeholder="Full name"
                                    />
                                ) : (
                                    displayName
                                )}
                            </h2>

                            <div className="folder-header-actions-row">
                                {isEditing ? (
                                    <>
                                        <button
                                            className="folder-save-btn"
                                            onClick={handleSave}
                                            disabled={
                                                saving ||
                                                Object.keys(errors).length > 0
                                            }
                                        >
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            className="folder-cancel-btn"
                                            onClick={handleCancel}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="folder-edit-btn"
                                        onClick={handleStartEdit}
                                    >
                                        <EditIcon />
                                        <span>Edit</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="dd-info__grid">
                            {/* Email */}
                            <div className="dd-field">
                                <span className="dd-label">Email:</span>
                                {isEditing ? (
                                    <input
                                        className="pd-input"
                                        value={editForm?.email || ""}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <a href={`mailto:${doctor?.email}`}>
                                        {doctor?.email}
                                    </a>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="dd-field">
                                <span className="dd-label">Phone:</span>
                                {isEditing ? (
                                    <div style={{ width: "100%" }}>
                                        <input
                                            className="pd-input"
                                            value={editForm?.phone || ""}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.phone && (
                                            <div
                                                style={{
                                                    color: "#b82020",
                                                    fontSize: 12,
                                                    marginTop: 4,
                                                }}
                                            >
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span>{doctor?.phone || "N/A"}</span>
                                )}
                            </div>

                            {/* Birthday */}
                            <div className="dd-field">
                                <span className="dd-label">Birthday:</span>
                                {isEditing ? (
                                    <input
                                        className="pd-input"
                                        type="date"
                                        value={editForm?.birthday || ""}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "birthday",
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <span>{doctor?.birthday || "N/A"}</span>
                                )}
                            </div>

                            {/* Age (computed) */}
                            <div className="dd-field">
                                <span className="dd-label">Age:</span>
                                {isEditing ? (
                                    <input
                                        className="pd-input"
                                        type="number"
                                        value={
                                            editForm?.age !== undefined
                                                ? editForm?.age
                                                : ""
                                        }
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "age",
                                                e.target.value
                                            )
                                        }
                                        min={0}
                                    />
                                ) : (
                                    <span>
                                        {doctor?.age ?? editForm?.age ?? "N/A"}
                                    </span>
                                )}
                            </div>

                            {/* Address */}
                            <div className="dd-field">
                                <span className="dd-label">Address:</span>
                                {isEditing ? (
                                    <input
                                        className="pd-input"
                                        value={editForm?.address || ""}
                                        onChange={(e) =>
                                            handleFieldChange(
                                                "address",
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <span>{doctor?.address || "N/A"}</span>
                                )}
                            </div>

                            {/* Experience (years) */}
                            <div className="dd-field">
                                <span className="dd-label">
                                    Experience (years):
                                </span>
                                {isEditing ? (
                                    <div style={{ width: "100%" }}>
                                        <input
                                            className="pd-input"
                                            type="number"
                                            min={0}
                                            value={editForm?.experience ?? ""}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    "experience",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.experience && (
                                            <div
                                                style={{
                                                    color: "#b82020",
                                                    fontSize: 12,
                                                    marginTop: 4,
                                                }}
                                            >
                                                {errors.experience}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span>{doctor?.experience ?? "N/A"}</span>
                                )}
                            </div>

                            {/* Language (multi-select) */}
                            <div className="dd-field">
                                <span className="dd-label">Language:</span>
                                {isEditing ? (
                                    <div style={{ width: "100%" }}>
                                        <select
                                            className="pd-input"
                                            multiple
                                            value={editForm?.language || []}
                                            onChange={(e) =>
                                                handleLanguageChange(
                                                    e.target.selectedOptions
                                                )
                                            }
                                            style={{ height: 110 }}
                                        >
                                            {LANG_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <span>
                                        {Array.isArray(doctor?.language)
                                            ? doctor.language.join(", ")
                                            : doctor?.language || "N/A"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Speciality */}
                        <div className="dd-speciality">
                            <span className="dd-label">Speciality:</span>
                            {isEditing ? (
                                <input
                                    className="pd-input"
                                    value={editForm?.speciality || ""}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "speciality",
                                            e.target.value
                                        )
                                    }
                                />
                            ) : (
                                <span>{doctor?.speciality || "N/A"}</span>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
