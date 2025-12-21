// src/pages/workSpace/doctors/Doctors.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./doctors.css";

import doctorAvatar from "../../../assets/doctor-avatar.svg";
import WorkspaceTopBar from "../../../components/Workspace/WorkspaceTopBar";
import DoctorModalForm from "./doctorModelForm/doctorModelForm";
import { apiUtils } from "../../../utils/newRequest";

export default function Doctors() {
    const navigate = useNavigate();

    const [openDoctorModal, setOpenDoctorModal] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const response = await apiUtils.get("/user/readDoctors");
            const list = response?.data?.metadata?.doctors || [];
            setDoctors(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleCreateDoctor = async (data) => {
        // Normalize input from modal to match backend fields
        const payload = {
            fullName: data?.fullName || "",
            phone: data?.phone || data?.phoneNumber || "",
            email: data?.email || "",
            speciality: data?.speciality || data?.specialty || "",
            description: data?.description || "",
        };

        try {
            const response = await apiUtils.post("/user/createDoctor", payload);
            const created = response?.data?.metadata?.doctor;

            // Option A: re-fetch to ensure consistency
            await fetchDoctors();

            // Option B (if you want append instead of refetch):
            // if (created) setDoctors((prev) => [created, ...(prev || [])]);

            setOpenDoctorModal(false);
        } catch (error) {
            console.error("Error creating doctor:", error);
        }
    };

    const getDoctorId = (doctor) => doctor?._id || doctor?.id;
    const getDoctorName = (doctor) =>
        doctor?.fullName || doctor?.name || "Unnamed";
    const getDoctorSpeciality = (doctor) =>
        doctor?.speciality || doctor?.specialty || "";

    return (
        <div className="doctors">
            <WorkspaceTopBar />

            <section className="doctors-card">
                <div className="doctors-card-top">
                    <div className="doctors-tabs">
                        <p className="doctors-tab">Clinic Doctors</p>
                    </div>

                    <button
                        className="doctors-btn-ghost"
                        onClick={() => setOpenDoctorModal(true)}
                        type="button"
                    >
                        <span>＋</span>
                        <span>Doctor</span>
                    </button>
                </div>

                {loading ? (
                    <div className="doctors-empty">Loading...</div>
                ) : doctors?.length ? (
                    <div className="doctors-grid">
                        {doctors.map((doctor) => {
                            const id = getDoctorId(doctor);
                            const name = getDoctorName(doctor);
                            const spec = getDoctorSpeciality(doctor);

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className="doctors-item"
                                    onClick={() =>
                                        navigate(`/workspace/doctors/${id}`, {
                                            state: { doctor },
                                        })
                                    }
                                >
                                    <img
                                        src={doctorAvatar}
                                        alt={name}
                                        className="doctors-avatar"
                                    />
                                    <span className="doctors-name">{name}</span>
                                    {spec ? (
                                        <span className="doctors-specialty">
                                            {spec}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="doctors-empty">No doctors yet.</div>
                )}
            </section>

            {openDoctorModal && (
                <DoctorModalForm
                    onClose={() => setOpenDoctorModal(false)}
                    onSubmit={handleCreateDoctor}
                />
            )}
        </div>
    );
}
