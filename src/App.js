// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Make sure to use Routes and Route for v6
import LandingPage from './LandingPage';
import ServicePage from './pages/ServicePage'; // Make sure the path is correct
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
