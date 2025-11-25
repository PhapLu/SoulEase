import { useState } from "react";
import "./Auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputs, setInputs] = useState({
    email: "",
    fullName: "",
    password: "",
    clinicians: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Sign up with:", inputs);
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1 className="signin-brand">SoulEase</h1>

        <div className="signin-card-inner">
          <h2 className="signin-title">Sign Up</h2>
          <p className="signin-subtitle">Welcome to SoulEase</p>

          <form className="signin-form" onSubmit={onSubmit}>
            {/* Email */}
            <label className="signin-field">
              <span className="signin-label">Email</span>
              <div className="signin-input-wrapper">
                <span className="signin-input-icon">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={inputs.email}
                  onChange={onChange}
                  required
                />
              </div>
            </label>

            {/* Full Name */}
            <label className="signin-field">
              <span className="signin-label">Full name</span>
              <div className="signin-input-wrapper">
                <span className="signin-input-icon">
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={inputs.fullName}
                  onChange={onChange}
                  required
                />
              </div>
            </label>

            {/* Password */}
            <label className="signin-field">
              <span className="signin-label">Password</span>
              <div className="signin-input-wrapper">
                <span className="signin-input-icon">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={inputs.password}
                  onChange={onChange}
                  required
                />
                <button
                  type="button"
                  className="signin-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <i className="fa-regular fa-eye-slash"></i>
                  ) : (
                    <i className="fa-regular fa-eye"></i>
                  )}
                </button>
              </div>
            </label>

            {/* Clinicians dropdown */}
            <label className="signin-field">
              <span className="signin-label">
                How many clinicians are in your practice?
              </span>
              <select
                className="signup-select"
                name="clinicians"
                value={inputs.clinicians}
                onChange={onChange}
                required
              >
                <option value="">Select one</option>
                <option value="1-5">1–5</option>
                <option value="6-20">6–20</option>
                <option value="21-50">21–50</option>
                <option value="50+">50+</option>
              </select>
            </label>

            <button type="submit" className="signin-submit-btn">
              Sign up
            </button>

            <div className="signin-footer-text">
              Have an account already?{" "}
              <a href="/signin" className="signin-link">
                Sign In
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
