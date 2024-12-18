// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ServicePage from './pages/ServicePage'; // Correct path if it's in a subfolder
import ContactPage from './pages/ContactPage'; // Import the new ContactPage
import MemberPage from './pages/MemberPage'; // Import the new MemberPage
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './LandingPage.css'; // Global styles

function App() {
  return (
    <>
      <Navbar />
      <Routes> {/* Use Routes for routing */}
        <Route path="/" element={<LandingPage />} /> {/* Home Route */}
        <Route path="/services" element={<ServicePage />} /> {/* Services Route */}
        <Route path="/contact" element={<ContactPage />} /> {/* Contact Page Route */}
        <Route path="/member" element={<MemberPage />} /> {/* Contact Page Route */}
        {/* Add other routes here if needed */}
      </Routes>
      <Footer />
    </>
  );
}

export default App;
