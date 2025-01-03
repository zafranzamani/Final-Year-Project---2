import React, { useState } from 'react';
import './StaffLogin.css';

function StaffLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous error messages
  
    try {
      const response = await fetch('http://localhost:5000/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'An unexpected error occurred.');
      } else {
        const { accessToken, refreshToken } = await response.json();
        sessionStorage.setItem('authToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error.message);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="staff-login-container">
      <div className="staff-login-box">
        <h1>Staff Login</h1>
        <p>Enter your account details to sign in</p>
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="input-group-staff">
            <div className="icon user-icon">
              <img src={`${process.env.PUBLIC_URL}/user-icon.png`} alt="User Icon" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>

          {/* Password Input */}
          <div className="input-group-staff">
            <div className="icon lock-icon">
              <img src={`${process.env.PUBLIC_URL}/lock-icon.png`} alt="Lock Icon" />
            </div>
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <span onClick={togglePasswordVisibility} className="password-toggle-staff">
              {passwordVisible ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          {errorMessage && (
          <div className="error-message">{errorMessage}</div> // Display error message
        )}
          {/* Forgot Password Link */}
          <a href="/forgot-password" className="forgot-password">
            Forgot Password?
          </a>

          {/* Submit Button */}
          <button type="submit" className="sign-in-button">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
}

export default StaffLogin;
