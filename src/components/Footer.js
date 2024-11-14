// src/components/Footer.js
import React from 'react';
import '../LandingPage.css';  // This should be enough if the styles are in this file.

function Footer() {
  return (
    <footer className="footer">
<div className="footer-content">
<div className="footer-left">
<img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Bob's Barber Shop" className="footer-logo" />
<p>Full service barber shop & <br />men's grooming studio. <br />Malaysia. 31400.</p>
</div>
<div className="footer-right">
        <h3>Contact us</h3>
<div className="contact-info">
  <div className="contact-icons">
    <img src={`${process.env.PUBLIC_URL}/email-icon.png`} alt="Email Icon" className="contact-icon" />
  </div>
  <p><a href="mailto:bobbarbershop43@gmail.com">bobbarbershop43@gmail.com</a></p>
</div>
<div className="contact-info">
  <div className="contact-icons">
    <img src={`${process.env.PUBLIC_URL}/phone-icon.png`} alt="Phone Icon" className="contact-icon" />
  </div>
  <p><a href="tel:+60163447022">(+60) 16 344-7022</a></p>
</div>
<div className="social-links">
  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
    <img src={`${process.env.PUBLIC_URL}/instagram-logo.png`} alt="Instagram" className="social-icon" />
  </a>
  <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
    <img src={`${process.env.PUBLIC_URL}/tiktok-logo.png`} alt="TikTok" className="social-icon" />
  </a>
</div>
</div>
</div>
</footer>
  );
}

export default Footer;


