export function EditIcon({ size = 16, color = "#0c1317", style, className }) {
    return (
        <svg
            style={style}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            width={size}
            viewBox="0 -960 960 960"
            fill={color}
        >
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
        </svg>
    );
}

export function RemoveIcon({ size = 20, color = "#ef4444", style, className }) {
    return (
        <svg
            style={style}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            width={size}
            viewBox="0 -960 960 960"
            fill={color}
        >
            <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" />
        </svg>
    );
}

export function AddIcon({ size = 16, color = "#000", style, className }) {
    return (
        <svg
            style={{ verticalAlign: "middle", ...style }}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            height={size}
            width={size}
            viewBox="0 -960 960 960"
            fill={color}
        >
            <path d="M440-200v-240H200v-160h240v-240h160v240h240v160H600v240H440Z" />
        </svg>
    );
}
