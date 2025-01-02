import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import LandingPage from './LandingPage';
import ServicePage from './pages/ServicePage';
import ContactPage from './pages/ContactPage';
import MemberPage from './pages/MemberPage';
import StaffLogin from './pages/StaffLogin';
import Dashboard from './pages/Dashboard';
import CustomerStaff from './pages/CustomerStaff';
import Product from './pages/Product';
import Supplier from './pages/Supplier';
import Report from './pages/Report';
import ProtectedRoute from './pages/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SessionManager from './SessionManager';
import './LandingPage.css';
import { monitorToken } from './SessionManager';
import MemberDashboard from './pages/memberDashboard';

function App() {
  const location = useLocation();

  const validRoutes = [
    '/',
    '/services',
    '/contact',
    '/member',
    '/staff',
    '/dashboard',
    '/customerstaff',
    '/product',
    '/supplier',
    '/report',
    '/member-dashboard'
  ];
  // If current path is not in valid routes, hide navbar and footer
  const isValidRoute = validRoutes.includes(location.pathname);
  
  const hideNavbarFooterRoutes = [
    '/dashboard',
    '/customerstaff',
    '/product',
    '/supplier',
    '/report',
    '/member-dashboard',
  ];
  const shouldHideNavbarFooter = hideNavbarFooterRoutes.includes(location.pathname);

  useEffect(() => {
    monitorToken();
  }, []);

  return (
    <>
      {!shouldHideNavbarFooter && <Navbar />}
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/member" element={<MemberPage />} />
        <Route path="/staff" element={<StaffLogin />} />

        {/* Protected Member Route */}
        <Route
          path="/member-dashboard"
          element={
            <ProtectedRoute type="member">
              <SessionManager />
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Staff Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute type="staff">
              <SessionManager />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customerstaff"
          element={
            <ProtectedRoute type="staff">
              <SessionManager />
              <CustomerStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product"
          element={
            <ProtectedRoute type="staff">
              <SessionManager />
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier"
          element={
            <ProtectedRoute type="staff">
              <SessionManager />
              <Supplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute type="staff">
              <SessionManager />
              <Report />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!shouldHideNavbarFooter && <Footer />}
    </>
  );
}

export default App;