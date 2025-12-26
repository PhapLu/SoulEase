import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUtils } from "../../../utils/newRequest";
import "./UserProfile.css";

export default function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });
    const [changingPw, setChangingPw] = useState(false);
    const [pwMsg, setPwMsg] = useState("");

    // =========================
    // FETCH USER PROFILE
    // =========================
    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await apiUtils.get(
                    `/user/readUserProfile/${userId}`
                );
                setUser(res.data.metadata.user);
            } catch (e) {
                setError(
                    e?.response?.data?.message || "Failed to load profile"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    // =========================
    // HELPERS
    // =========================
    const onChange = (key, value) => {
        setUser((prev) => ({ ...prev, [key]: value }));
    };

    const onNestedChange = (group, key, value) => {
        setUser((prev) => ({
            ...prev,
            [group]: {
                ...(prev[group] || {}),
                [key]: value,
            },
        }));
    };

    // =========================
    // SAVE
    // =========================
    const onSave = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError("");

        try {
            await apiUtils.patch(`/user/updateUserProfile/${userId}`, user);
        } catch (e) {
            setError(e?.response?.data?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const role = user?.role;

    const onBack = () => {
        if (role === "doctor" || role === "nurse") {
            navigate("/workspace/patients");
        } else if (role === "clinic") {
            navigate("/workspace/staffs");
        } else if (role === "patient" || role === "relative") {
            navigate("/workspace/records");
        }
    };

    const onPwChange = (key, value) => {
        setPw((prev) => ({ ...prev, [key]: value }));
    };

    const onChangePassword = async (e) => {
        e.preventDefault();
        setPwMsg("");

        if (!pw.oldPassword || !pw.newPassword) {
            setPwMsg("Please enter old and new password");
            return;
        }

        try {
            setChangingPw(true);

            await apiUtils.patch(`/user/changePassword/${userId}`, {
                oldPassword: pw.oldPassword,
                newPassword: pw.newPassword,
            });

            setPw({ oldPassword: "", newPassword: "" });
            setPwMsg("Password changed successfully ✅");
        } catch (e2) {
            setPwMsg(e2?.response?.data?.message || "Change password failed");
        } finally {
            setChangingPw(false);
        }
    };

    if (loading) return <div className="pp-card">Loading...</div>;
    if (error) return <div className="pp-error">{error}</div>;
    if (!user) return null;

    // =========================
    // UI
    // =========================
    return (
        <div className="pp-page">
            <div className="pp-navbar">
                <button type="button" className="pp-nav-back" onClick={onBack}>
                    ← Back
                </button>

                <div className="pp-header">
                    <div>
                        <h3 className="pp-title">User Profile</h3>
                    </div>
                </div>

                <div className="pp-navbar-right" />
            </div>

            <div className="pp-layout">
                {/* COL-3 */}
                <aside className="pp-col-3">
                    <section className="pp-card">
                        <div className="pp-side-title">Change Avatar</div>

                        <div className="pp-avatarBox">
                            <div className="pp-avatarImg"></div>

                            <label className="pp-uploadBtn">
                                Upload Photo
                                <input type="file" hidden />
                            </label>
                        </div>

                        <form onSubmit={onChangePassword} className="pp-pwForm">
                            <div className="pp-side-title">Change Password</div>
                            <label className="pp-field">
                                <div className="pp-label">Old password</div>
                                <input
                                    className="pp-input"
                                    type="password"
                                    value={pw.oldPassword}
                                    onChange={(e) =>
                                        onPwChange(
                                            "oldPassword",
                                            e.target.value
                                        )
                                    }
                                />
                            </label>

                            <label className="pp-field">
                                <div className="pp-label">New password</div>
                                <input
                                    className="pp-input"
                                    type="password"
                                    value={pw.newPassword}
                                    onChange={(e) =>
                                        onPwChange(
                                            "newPassword",
                                            e.target.value
                                        )
                                    }
                                />
                            </label>

                            {pwMsg && <div className="pp-pwMsg">{pwMsg}</div>}

                            <button
                                className="pp-btn pp-btn--ghost"
                                type="submit"
                                disabled={changingPw}
                            >
                                {changingPw ? "Changing..." : "Change Password"}
                            </button>
                        </form>
                    </section>
                </aside>

                <main className="pp-col-9">
                    <section className="pp-card">
                        <form className="pp-form" onSubmit={onSave}>
                            <div className="pp-grid">
                                {/* BASIC INFO */}
                                <label className="pp-field">
                                    <div className="pp-label">Full name</div>
                                    <input
                                        className="pp-input"
                                        value={user.fullName || ""}
                                        onChange={(e) =>
                                            onChange("fullName", e.target.value)
                                        }
                                    />
                                </label>

                                <label className="pp-field">
                                    <div className="pp-label">Email</div>
                                    <input
                                        className="pp-input"
                                        value={user.email || ""}
                                        disabled
                                    />
                                </label>

                                <label className="pp-field">
                                    <div className="pp-label">
                                        Date of birth
                                    </div>
                                    <input
                                        className="pp-input"
                                        type="date"
                                        value={
                                            user.dob
                                                ? user.dob.slice(0, 10)
                                                : ""
                                        }
                                        onChange={(e) =>
                                            onChange("dob", e.target.value)
                                        }
                                    />
                                </label>

                                <label className="pp-field">
                                    <div className="pp-label">Gender</div>
                                    <select
                                        className="pp-input"
                                        value={user.gender || ""}
                                        onChange={(e) =>
                                            onChange("gender", e.target.value)
                                        }
                                    >
                                        <option value="">—</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </label>

                                <label className="pp-field">
                                    <div className="pp-label">Phone</div>
                                    <input
                                        className="pp-input"
                                        value={user.phone || ""}
                                        onChange={(e) =>
                                            onChange("phone", e.target.value)
                                        }
                                    />
                                </label>

                                <label className="pp-field">
                                    <div className="pp-label">Address</div>
                                    <input
                                        className="pp-input"
                                        value={user.address || ""}
                                        onChange={(e) =>
                                            onChange("address", e.target.value)
                                        }
                                    />
                                </label>

                                {/* DEFAULT PASSWORD */}
                                {(role === "clinic" || role === "doctor") && (
                                    <label className="pp-field pp-field--span2">
                                        <div className="pp-label">
                                            Default password
                                        </div>
                                        <input
                                            className="pp-input"
                                            value={user.defaultPassword || ""}
                                        />
                                    </label>
                                )}

                                {/* DOCTOR */}
                                {role === "doctor" && (
                                    <>
                                        <label className="pp-field">
                                            <div className="pp-label">
                                                Speciality
                                            </div>
                                            <input
                                                className="pp-input"
                                                value={
                                                    user.doctorProfile
                                                        ?.speciality || ""
                                                }
                                                onChange={(e) =>
                                                    onNestedChange(
                                                        "doctorProfile",
                                                        "speciality",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className="pp-field pp-field--span2">
                                            <div className="pp-label">
                                                Description
                                            </div>
                                            <textarea
                                                className="pp-input pp-textarea"
                                                value={
                                                    user.doctorProfile
                                                        ?.description || ""
                                                }
                                                onChange={(e) =>
                                                    onNestedChange(
                                                        "doctorProfile",
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </label>
                                    </>
                                )}

                                {/* NURSE */}
                                {role === "nurse" && (
                                    <label className="pp-field pp-field--span2">
                                        <div className="pp-label">
                                            Assist doctor ID
                                        </div>
                                        <input
                                            className="pp-input"
                                            value={
                                                user.nurseProfile
                                                    ?.assistDoctorId || ""
                                            }
                                            onChange={(e) =>
                                                onNestedChange(
                                                    "nurseProfile",
                                                    "assistDoctorId",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </label>
                                )}

                                {/* CLINIC */}
                                {role === "clinic" && (
                                    <label className="pp-field pp-field--span2">
                                        <div className="pp-label">
                                            Clinicians
                                        </div>
                                        <input
                                            className="pp-input"
                                            value={
                                                user.clinicProfile
                                                    ?.clinicians || ""
                                            }
                                            onChange={(e) =>
                                                onNestedChange(
                                                    "clinicProfile",
                                                    "clinicians",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="pp-actions">
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
                </main>
            </div>
        </div>
    );
}
