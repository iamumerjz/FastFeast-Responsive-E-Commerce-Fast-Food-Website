import React, { useRef, useEffect, useState } from "react";
import "./Footer.css";

const Footer = () => {
  const footerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );

    observer.observe(footer);

    return () => observer.unobserve(footer);
  }, []);

  return (
    <footer
      id="footer-contact"
      className={`footer-section${visible ? " footer-visible" : ""}`}
      ref={footerRef}
    >
      <div className="footer-columns">
        {/* Contact Us */}
        <div className="footer-col left">
          <h3 className="footer-title">Contact Us</h3>
          <div className="footer-map">
            <iframe
              title="FastFeast Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212644.89285534318!2d72.92095461210232!3d33.616292443790904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbfd07891722f%3A0x6059515c3bdb02b6!2sIslamabad%2C%20Pakistan!5e0!3m2!1sen!2s!4v1748412751955!5m2!1sen!2s"
              width="250"
              height="100"
              style={{ border: 0, borderRadius: 8 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="footer-contact">
            <div>
              <span className="footer-icon">
                <i className="fas fa-map-marker-alt"></i>
              </span>
              Islamabad, Pakistan
            </div>
            <div>
              <span className="footer-icon">
                <i className="fas fa-phone"></i>
              </span>
              +92 3123456789
            </div>
            <div>
              <span className="footer-icon">
                <i className="fas fa-envelope"></i>
              </span>
              contactus@fastfeast.com
            </div>
          </div>
        </div>

        {/* Brand/About */}
        <div className="footer-col center">
          <h3 className="footer-title">FastFeast</h3>
          <form
            className="footer-newsletter"
            onSubmit={(e) => e.preventDefault()}
          >
            <label
              htmlFor="footer-newsletter-input"
              className="footer-newsletter-label"
            >
              Follow Us!
            </label>
            <div className="footer-newsletter-form">
              <input
                type="email"
                id="footer-newsletter-input"
                className="footer-newsletter-input"
                placeholder="Subscribe to our newsletter"
                required
              />
              <button type="submit" className="footer-newsletter-btn">
                Subscribe
              </button>
            </div>
          </form>

          <div className="footer-socials">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              title="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://linkedin.com/iamumerjz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="footer-col right">
          <h3 className="footer-title">Opening Hours</h3>
          <div>Everyday</div>
          <div>10.00 Am - 10.00 Pm</div>
        </div>
      </div>
      <div className="footer-bottom">© 2025 All Rights Reserved By FastFeast</div>
    </footer>
  );
};

export default Footer;
