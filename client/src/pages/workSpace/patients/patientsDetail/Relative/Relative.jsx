import React, { useMemo, useState } from "react";
import RelativeModalForm from "./relativeModelForm/RelativeModelForm";
import "./Relative.css";

export default function Relative({
    relatives = [],
    readOnly,
    onCreateRelative,
}) {
    const [openCreate, setOpenCreate] = useState(false);

    const list = useMemo(
        () => (Array.isArray(relatives) ? relatives : []),
        [relatives]
    );

    return (
        <div className="rel-wrap">
            <div className="rel-title-row">
                <div className="pd-treatment">
                    <h3 title="Open treatment details">Relatives</h3>
                </div>

                {!readOnly && (
                    <button
                        type="button"
                        className="rel-create-btn"
                        onClick={() => setOpenCreate(true)}
                    >
                        + Create
                    </button>
                )}
            </div>

            <div className="rel-card">
                <div className="rel-table-head">
                    <div className="rel-col rel-col--name">Full name</div>
                    <div className="rel-col rel-col--email">Email</div>
                    <div className="rel-col rel-col--phone">Phone</div>
                    <div className="rel-col rel-col--relationship">
                        Relationship
                    </div>
                </div>

                {list.length === 0 ? (
                    <div className="rel-empty">No relatives yet.</div>
                ) : (
                    <div className="rel-table-body">
                        {list.map((r, idx) => (
                            <div
                                className="rel-row"
                                key={r?._id || r?.id || idx}
                            >
                                <div className="rel-col rel-col--name">
                                    {r?.fullName || r?.name || "-"}
                                </div>
                                <div className="rel-col rel-col--email">
                                    {r?.email || "-"}
                                </div>
                                <div className="rel-col rel-col--phone">
                                    {r?.phoneNumber || r?.phone || "-"}
                                </div>
                                <div className="rel-col rel-col--relationship">
                                    {r?.relationship || "-"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {openCreate && !readOnly && (
                <RelativeModalForm
                    onClose={() => setOpenCreate(false)}
                    onSubmit={async (payload) => {
                        await onCreateRelative?.(payload);
                        setOpenCreate(false);
                    }}
                />
            )}
        </div>
    );
}
