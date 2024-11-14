import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';  // Import useLocation to get current page URL
import '../LandingPage.css';

function Navbar() {
  const headlineRef = useRef(null);  // Create a reference for the headline section
  const location = useLocation();  // Get current route location

  // Function to scroll to the headline (only on LandingPage)
  const scrollToHeadline = () => {
    if (headlineRef.current) {
      headlineRef.current.scrollIntoView({ 
        behavior: 'smooth', // Smooth scroll behavior
        block: 'start'  // Start position of the element
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        {/* Check if we're on the LandingPage, and scroll to headline, otherwise navigate */}
        {location.pathname === '/' ? (
          <a href="#headline" onClick={scrollToHeadline}> {/* Link directly to headline with smooth scrolling */}
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Bob's Barber Shop" />
          </a>
        ) : (
          <Link to="/">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Bob's Barber Shop" />
          </Link>
        )}
      </div>
      <ul className="nav-links">
        <li>
          {/* If we're on the LandingPage, scroll to headline; otherwise, navigate to LandingPage */}
          {location.pathname === '/' ? (
            <a href="#headline" onClick={scrollToHeadline}>Home</a>
          ) : (
            <Link to="/">Home</Link>
          )}
        </li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/member">Member</Link></li>
        <li><Link to="/staff">Staff</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
