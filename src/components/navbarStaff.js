import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavbarStaff.css';

function NavbarStaff() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`navbar-staff ${isOpen ? 'open' : 'closed'}`}>
      <div className="navbar-header-staff">
        <button className="toggle-button" onClick={toggleNavbar}>
          {isOpen ? '≡' : '☰'}
        </button>
      </div>
      <nav className={`nav-links-staff ${isOpen ? '' : 'hidden'}`}>
        <NavLink to="/dashboard" activeClassName="active">
          Dashboard
        </NavLink>
        <NavLink to="/customer" activeClassName="active">
          Customer
        </NavLink>
        <NavLink to="/product" activeClassName="active">
          Product
        </NavLink>
        <NavLink to="/supplier" activeClassName="active">
          Supplier
        </NavLink>
        <NavLink to="/report" activeClassName="active">
          Report
        </NavLink>
      </nav>
    </div>
  );
}

export default NavbarStaff;
