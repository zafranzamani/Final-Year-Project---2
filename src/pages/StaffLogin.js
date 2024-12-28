import React, { useState } from 'react';
import './StaffLogin.css';

function StaffLogin() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    // Add your login logic here
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
            <input type="text" placeholder="Username" required />
          </div>

          {/* Password Input */}
          <div className="input-group-staff">
            <div className="icon lock-icon">
              <img src={`${process.env.PUBLIC_URL}/lock-icon.png`} alt="Lock Icon" />
            </div>
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Password"
              required
            />
            <span onClick={togglePasswordVisibility} className="password-toggle-staff">
              {passwordVisible ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>

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
