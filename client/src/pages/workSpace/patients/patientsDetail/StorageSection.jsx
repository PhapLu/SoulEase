// StorageSection.jsx
export default function StorageSection() {
    return (
        <section className="pd-storage">
            <h3>Storage</h3>
            <div className="pd-storage__tabs">
                <button className="active">Image</button>
                <button>Files</button>
            </div>
            <div className="pd-storage__box" />
        </section>
    );
}
