import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, type = 'staff' }) {
  const location = useLocation();
  
  // Check for staff auth
  if (type === 'staff') {
    const authToken = sessionStorage.getItem('authToken');
    if (!authToken) {
      return <Navigate to="/staff" state={{ from: location.pathname }} />;
    }
  }
  
  // Check for member auth
  if (type === 'member') {
    const memberToken = localStorage.getItem('memberToken') || sessionStorage.getItem('memberToken');
    if (!memberToken) {
      return <Navigate to="/member" state={{ from: location.pathname }} />;
    }
  }

  return children;
}

export default ProtectedRoute;