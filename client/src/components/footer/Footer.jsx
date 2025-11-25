import "./Footer.css";
import logo from "../../assets/logo.png";
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
            <i className="fa-brands fa-facebook"></i>
            <i className="fa-brands fa-square-instagram"></i>
            <i className="fa-brands fa-github"></i>
          </div>
        </div>

        {/* Columns */}
        <div className="se-footer-columns">
          {/* Legal */}
          <div className="se-footer-col">
            <h4>Legal</h4>
            <p>Lorem Ipsum</p>
            <p>Lorem Ipsum</p>
          </div>

          {/* Developers */}
          <div className="se-footer-col">
            <h4>Developers</h4>
            <p>Luu Quoc Phap</p>
            <p>Truong Gia Hy</p>
            <p>Pham Tran Bao Tran</p>
            <p>Le Minh Tuan</p>
          </div>

          {/* Support */}
          <div className="se-footer-col">
            <h4>Help & support</h4>
            <p>Lorem Ipsum</p>
            <p>Lorem Ipsum</p>
          </div>

          {/* Address */}
          <div className="se-footer-col">
            <h4>Our address:</h4>
            <p>702 Nguyen Van Linh, Tan Hung Ward,</p>
            <p>Ho Chi Minh City, Vietnam</p>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="se-footer-bottom">
        Copyright © 2025 SoulEase – All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
