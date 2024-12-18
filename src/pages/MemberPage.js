import React, { useState } from 'react';
import './MemberPage.css';

function MemberPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="member-page">
      {/* Left Panel - Login Form */}
      <div className="login-panel">
        <h1>Login to your Account</h1>
        <p>Select method to log in:</p>
        <button className="google-button">
          <img src={`${process.env.PUBLIC_URL}/google-icon.png`} alt="Google" /> Google
        </button>
        <p className="login-subtext">or continue with username</p>

        <form className="login-form">
          <div className="input-group">
            <input type="text" placeholder="username" />
          </div>
          <div className="input-group password-group">
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Password"
            />
            <span onClick={togglePasswordVisibility} className="password-toggle">
              {passwordVisible ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/" className="forgot-password">Forgot Password?</a>
          </div>
          <button type="submit" className="login-button">LOGIN</button>
        </form>
      </div>

      {/* Right Panel - Promotional Section */}
      <div className="promo-panel">
        <div className="promo-box">
        <img src="logo2.png" alt="Bob's Barber Shop Logo" />
          <p className="promo-text">
            Hi there, join our membership</p> 
            <p className="promo-text">today and enjoy</p>
          
          <h1 className="promo-discount">15% OFF</h1>
          <p className="promo-text22">for your every cut</p>
          <p className="promo-signup">
            Don't have an account? <a href="/" className="create-account">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default MemberPage;
