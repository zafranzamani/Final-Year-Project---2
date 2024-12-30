import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';


function logoutUser() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken'); // Clear refresh token
    window.location.href = '/staff';
  }
  
function refreshAccessToken() {
    const refreshToken = sessionStorage.getItem('refreshToken');
  
    if (!refreshToken) {
      logoutUser();
      return;
    }

    fetch('http://localhost:5000/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to refresh token.');
    
          return response.json();
        })
        .then((data) => {
          const { accessToken } = data;
          sessionStorage.setItem('authToken', accessToken); // Store the new access token
          monitorToken(); // Reinitialize token monitoring
        })
        .catch((error) => {
          console.error('Refresh token error:', error.message);
          logoutUser(); // Log out if refresh fails
        });
    }

    export function monitorToken() {
        const token = sessionStorage.getItem('authToken');
        if (!token) return;
      
        try {
          const decodedToken = jwtDecode(token);
          const tokenExpiration = decodedToken.exp * 1000; // Convert to milliseconds
          const timeToExpire = tokenExpiration - Date.now();
      
          if (timeToExpire > 0) {
            // Set a timeout to refresh the token before it expires
            setTimeout(refreshAccessToken, timeToExpire - 1000); // Refresh 1 second before expiration
          } else {
            // Token is already expired, refresh immediately
            refreshAccessToken();
          }
        } catch (error) {
          console.error('Error decoding token:', error.message);
          logoutUser(); // Log out on invalid token
        }
      }

function SessionManager() {
  useEffect(() => {
    let sessionTimeout;

    const resetSessionTimeout = () => {
      // Clear any existing timeout
      clearTimeout(sessionTimeout);

      // Set a new timeout for 15 minutes (900,000 ms)
      sessionTimeout = setTimeout(() => {
        alert('Session expired due to inactivity. You have been logged out.');
        sessionStorage.removeItem('refreshToken'); // Clear refresh token
        sessionStorage.removeItem('authToken'); // Remove the token from session storage
        window.location.href = '/staff'; // Redirect the user to the login page
      },15 * 60 * 1000); // 15 minutes (adjust as needed)
    };

    // Listen for user activity (mouse movements, keypress, clicks, etc.)
    window.addEventListener('mousemove', resetSessionTimeout);
    window.addEventListener('keypress', resetSessionTimeout);
    window.addEventListener('click', resetSessionTimeout);

    // Initialize the timeout on page load
    resetSessionTimeout();

    return () => {
      // Cleanup event listeners when the component unmounts
      window.removeEventListener('mousemove', resetSessionTimeout);
      window.removeEventListener('keypress', resetSessionTimeout);
      window.removeEventListener('click', resetSessionTimeout);
    };

    
  }, []);

  return null; // This component doesn't render anything
}

export default SessionManager;
