import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo.png";

const Header = () => {
  return (
    <header className="se-header">
      <div className="se-header-inner">
        {/* Brand */}
        <Link to="/" className="se-header-brand">
          <img src={logo} alt="SoulEase Logo" className="se-header-logo-img" />
          <span className="se-header-brand-text">SoulEase</span>
        </Link>

        {/* Nav */}
        <nav className="se-header-nav">
          <a href="#about">About us</a>
          <a href="#services">Services</a>
          <a href="#resources">Resources</a>
          <a href="#pricing">Pricing</a>
        </nav>

        {/* Actions */}
        <div className="se-header-actions">
          <Link to="/signin" className="se-header-btn se-header-btn-ghost">
            Sign in
          </Link>
          <Link to="/signup" className="se-header-btn se-header-btn-primary">
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
