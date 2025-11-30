import "./Footer.css";
import logo from "../../assets/logo.svg";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Footer = () => {
  return (
    <footer className="se-footer">
      <div className="se-footer-top-border"></div>

      <div className="se-footer-inner">
        {/* Logo + social */}
        <div className="se-footer-brand">
          <img src={logo} alt="SoulEase Logo" className="se-footer-logo" />

          <div className="se-footer-socials">
            <a href="#" aria-label="Facebook">
              <i className="fa-brands fa-facebook" />
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fa-brands fa-square-instagram" />
            </a>
            <a href="#" aria-label="Github">
              <i className="fa-brands fa-github" />
            </a>
          </div>
        </div>

        {/* Columns */}
        <div className="se-footer-columns">
          <div className="se-footer-col">
            <h4>Legal</h4>
            <p>Lorem Ipsum</p>
            <p>Lorem Ipsum</p>
          </div>

          <div className="se-footer-col">
            <h4>Developers</h4>
            <p>Luu Quoc Phap</p>
            <p>Truong Gia Hy</p>
            <p>Pham Tran Bao Tran</p>
            <p>Le Minh Tuan</p>
          </div>

          <div className="se-footer-col">
            <h4>Help & support</h4>
            <p>Lorem Ipsum</p>
            <p>Lorem Ipsum</p>
          </div>

          <div className="se-footer-col">
            <h4>Our address:</h4>
            <p>702 Nguyen Van Linh, Tan Hung Ward,</p>
            <p>Ho Chi Minh City, Vietnam</p>
          </div>
        </div>
      </div>

      <div className="se-footer-bottom">
        Copyright © 2025 SoulEase – All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
