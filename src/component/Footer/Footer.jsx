import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span>Wed</span>ora
          </Link>

          <p>
            Making your journey to the perfect wedding
            venue simple, beautiful and unforgettable.
          </p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>

          <Link to="/halls">Wedding Halls</Link>
          <Link to="/halls">Featured Halls</Link>
          <a href="/#how-it-works">How It Works</a>
        </div>

        <div className="footer-column">
          <h4>Company</h4>

          <a href="/#about">About Us</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
        </div>

        <div className="footer-column">
          <h4>For Hall Owners</h4>

          <Link to="/register">List Your Hall</Link>
          <Link to="/login">Owner Login</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Wedora. All rights reserved.</span>
        <span>Made for unforgettable moments.</span>
      </div>
    </footer>
  );
};

export default Footer;

