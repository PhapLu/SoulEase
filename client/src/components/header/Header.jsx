import { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo.svg";

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <header className="se-header">
      <div className="se-header__inner">
        {/* Logo */}
        <Link to="/" className="se-logo" onClick={closeMobile}>
          <img src={logo} alt="SoulEase logo" className="se-logo__svg" />
          <span className="se-logo__text">SoulEase</span>
        </Link>

        {/* MENU DESKTOP + MOBILE */}
        <nav
          className={`se-nav ${isMobileOpen ? "se-nav--open" : ""}`}
          aria-hidden={!isMobileOpen}
        >
          <Link to="/" className="se-nav__link" onClick={closeMobile}>
            Home
          </Link>
          <Link to="/about" className="se-nav__link" onClick={closeMobile}>
            About us
          </Link>
          <Link to="/services" className="se-nav__link" onClick={closeMobile}>
            Services
          </Link>
          <Link to="/resources" className="se-nav__link" onClick={closeMobile}>
            Resources
          </Link>
          <Link to="/pricing" className="se-nav__link" onClick={closeMobile}>
            Pricing
          </Link>

          {/* Actions MOBILE */}
          <div className="se-nav__mobile-actions">
            <Link
              to="/signin"
              className="se-actions__signin se-actions__signin--mobile"
              onClick={closeMobile}
            >
              Sign in
            </Link>
            <Link to="/auth/signup" onClick={closeMobile}>
              <button className="se-actions__trial se-actions__trial--mobile">
                Start free trial
              </button>
            </Link>
          </div>
        </nav>

        {/* Actions DESKTOP */}
        <div className="se-actions">
          <Link to="/auth/signin" className="se-actions__signin">
            Sign in
          </Link>
          <Link to="/auth/signup">
            <button className="se-actions__trial">Start free trial</button>
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          className={`se-menu-toggle ${
            isMobileOpen ? "se-menu-toggle--open" : ""
          }`}
          onClick={toggleMobile}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default Header;
