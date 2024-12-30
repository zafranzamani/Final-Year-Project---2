import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const authToken = sessionStorage.getItem('authToken'); // Retrieve the token from localStorage
  const location = useLocation(); // Get the current location

  if (!authToken) {
    // Redirect to login page, preserving the current location
    return <Navigate to="/staff" state={{ from: location }} />;
  }

  return children; // Allow access to the protected route
}

export default ProtectedRoute;
