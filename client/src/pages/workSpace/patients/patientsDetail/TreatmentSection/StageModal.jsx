// StageModal.jsx

import React from "react";
import "./TreatmentSession.css";

export default function StageModal({ open, title, onClose, children }) {
    if (!open) return null;

    return (
        <div className="tp-modal__backdrop" role="dialog" aria-modal="true">
            <div className="tp-modal">
                <div className="tp-modal__header">
                    <div className="tp-modal__title">{title}</div>
                    <button
                        className="tp-icon-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                <div className="tp-modal__body">{children}</div>
            </div>
        </div>
    );
}
