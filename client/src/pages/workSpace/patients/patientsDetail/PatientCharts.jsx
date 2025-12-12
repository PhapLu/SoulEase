// PatientCharts.jsx
export const chartSeries = [
    {
        title: "Sleep Quality",
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        data: [80, 60, 70, 65, 72, 85, 92],
    },
    {
        title: "Mood Rating",
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        data: [60, 70, 65, 68, 66, 78, 90],
    },
    {
        title: "Stress Level",
        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        data: [75, 58, 72, 65, 67, 70, 80],
    },
    {
        title: "CTB Task Completion",
        type: "progress",
        value: 68,
    },
];

export const ProgressCard = ({ value }) => (
    <div className="pd-progress">
        <div className="pd-progress__circle">
            <span>{value}%</span>
        </div>
    </div>
);

export const LineChartCard = ({ title, labels, data }) => {
    const viewWidth = 350;
    const viewHeight = 100;
    const max = Math.max(...data, 100);
    const points = data
        .map((v, idx) => {
            const x = (idx / (data.length - 1 || 1)) * viewWidth;
            const y = viewHeight - (v / max) * viewHeight;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <div className="pd-card">
            <div className="pd-card__header">
                <h4>{title}</h4>
                <button className="pd-icon-btn">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#e3e3e3"
                    >
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                    </svg>
                </button>
            </div>
            <div className="pd-chart">
                <svg
                    viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                >
                    <polyline
                        fill="none"
                        stroke="var(--primary-color)"
                        strokeWidth="2"
                        points={points}
                    />
                    {data.map((v, idx) => {
                        const x = (idx / (data.length - 1 || 1)) * viewWidth;
                        const y = viewHeight - (v / max) * viewHeight;
                        return (
                            <circle
                                key={idx}
                                cx={x}
                                cy={y}
                                r="2.8"
                                fill="var(--primary-color)"
                            />
                        );
                    })}
                </svg>
                <div className="pd-chart__labels">
                    {labels.map((l) => (
                        <span key={l}>{l}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};
