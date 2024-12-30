// src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './ScrollToTop'; // Import the component
import LandingPage from './LandingPage';
import ServicePage from './pages/ServicePage'; // Correct path if it's in a subfolder
import ContactPage from './pages/ContactPage'; // Import the new ContactPage
import MemberPage from './pages/MemberPage'; // Import the new MemberPage
import StaffLogin from './pages/StaffLogin'; // Import the new StaffLogin
import Dashboard from './pages/Dashboard'; // Import the Dashboard component
import ProtectedRoute from './pages/ProtectedRoute'; // Import the ProtectedRoute component
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SessionManager from './SessionManager'; // Import SessionManager
import './LandingPage.css'; // Global styles
import { monitorToken } from './SessionManager';

function App() {
  const location = useLocation();

  // Hide Navbar and Footer for specific routes
  const hideNavbarFooterRoutes = ['/dashboard']; // Add routes where Navbar and Footer should be hidden
  const shouldHideNavbarFooter = hideNavbarFooterRoutes.includes(location.pathname);
  useEffect(() => {
    monitorToken(); // Initialize token monitoring
  }, []);

  return (
    <>
      {/* Conditionally render Navbar */}
      {!shouldHideNavbarFooter && <Navbar />}
      <ScrollToTop /> {/* Ensures top positioning on route changes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} /> {/* Home Route */}
        <Route path="/services" element={<ServicePage />} /> {/* Services Route */}
        <Route path="/contact" element={<ContactPage />} /> {/* Contact Page Route */}
        <Route path="/member" element={<MemberPage />} /> {/* Member Page Route */}
        <Route path="/staff" element={<StaffLogin />} /> {/* Staff Login Page */}

        {/* Protected Route for Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SessionManager/> {/* Include SessionManager to handle session timeout */}
              <Dashboard /> {/* Only accessible if authenticated */}
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* Conditionally render Footer */}
      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}

export default App;
