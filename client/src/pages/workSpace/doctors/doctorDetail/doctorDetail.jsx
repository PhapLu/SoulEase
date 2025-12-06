import WorkspaceTopBar from "../../../../components/Workspace/WorkspaceTopBar";
import "./doctorDetail.css";

export default function DoctorDetail() {
  return (
    <div className="dd-page">
      <WorkspaceTopBar />

      <div className="dd-inner">
        <section className="dd-header">
          <div className="dd-avatar" />

          <div className="dd-info">
            <div className="dd-info__row">
              <h2>Dr. John Dante</h2>
              <span className="dd-info__sex">F/M</span>
              <button className="dd-icon-btn" aria-label="Edit profile">
                ✎
              </button>
            </div>

            <div className="dd-info__grid">
              <div className="dd-field">
                <span className="dd-label">Email:</span>
                <a href="mailto:abc@gmail.com">abc@gmail.com</a>
              </div>
              <div className="dd-field">
                <span className="dd-label">Phone:</span>
                <span>091234567</span>
              </div>
              <div className="dd-field">
                <span className="dd-label">Birthday:</span>
                <span>DD/MM/YYYY</span>
              </div>
              <div className="dd-field">
                <span className="dd-label">Age:</span>
                <span>{`{age}`}</span>
              </div>
              <div className="dd-field">
                <span className="dd-label">Address:</span>
                <span>{`{address}`}</span>
              </div>
              <div className="dd-field">
                <span className="dd-label">Experience:</span>
                <span>10 years</span>
              </div>
              <div className="dd-field">
                <span className="dd-label">Language:</span>
                <span>English, Spanish</span>
              </div>
            </div>

            <div className="dd-speciality">
              <span className="dd-label">Speciality:</span>
              <div className="dd-speciality__chips">
                <div className="dd-chip" />
                <div className="dd-chip" />
                <div className="dd-chip" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
