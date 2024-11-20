// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ServicePage from './pages/ServicePage'; // Correct path if it's in a subfolder
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
        {/* Add other routes here if needed */}
      </Routes>
      <Footer />
    </>
  );
}

export default App;
