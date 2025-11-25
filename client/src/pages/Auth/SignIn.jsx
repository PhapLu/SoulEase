import { useState } from "react";
import "./Auth.css";
import Header from "../../components/header/Header";
import "@fortawesome/fontawesome-free/css/all.min.css";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Sign in with:", inputs);
  };

  return (
    <>
      {/* HEADER */}
      <Header />

      {/* SIGN-IN PAGE */}
      <div className="signin-page">
        <div className="signin-card">
          <h1 className="signin-brand">SoulEase</h1>

          <div className="signin-card-inner">
            <h2 className="signin-title">Sign in</h2>
            <p className="signin-subtitle">Great to see you again</p>

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

              <button type="submit" className="signin-submit-btn">
                Sign in
              </button>

              <button type="button" className="signin-link-btn">
                Forget your password?
              </button>

              <div className="signin-footer-text">
                Are you new here?{" "}
                <a href="/auth/signup" className="signin-link">
                  Create a free account
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
