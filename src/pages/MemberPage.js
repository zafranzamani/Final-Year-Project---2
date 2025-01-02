import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MemberPage.css';
import CreateMember from './CreateMember';

function MemberPage() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isCreateMemberOpen, setIsCreateMemberOpen] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const openCreateMember = () => {
    setIsCreateMemberOpen(true);
  };

  const closeCreateMember = () => {
    setIsCreateMemberOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/member-login', {
        username: loginData.username,
        password: loginData.password
      });

      // Store tokens and user data
      if (loginData.rememberMe) {
        localStorage.setItem('memberToken', response.data.accessToken);
        localStorage.setItem('memberRefreshToken', response.data.refreshToken);
      } else {
        sessionStorage.setItem('memberToken', response.data.accessToken);
        sessionStorage.setItem('memberRefreshToken', response.data.refreshToken);
      }

      // Store user data
      localStorage.setItem('memberData', JSON.stringify(response.data.user));

      // Redirect to member dashboard
      navigate('/member-dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <form className="login-form" onSubmit={handleSubmit}> 
          <div className="input-group">
            <input 
              type="text"
              name="username"
              placeholder="Username"
              value={loginData.username}
              onChange={handleChange}
            />
          </div>
          
          <div className="input-group password-group">
            <input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleChange}
            />
            <span onClick={togglePasswordVisibility} className="password-toggle">
              {passwordVisible ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          {error && <div className="error-message-member-login">{error}</div>} 
          <div className="options-member">
            <label>
              <input 
                type="checkbox"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleChange}
              /> Remember me
            </label>
            <a href="/" className="forgot-password-member">Forgot Password?</a>
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>

      {/* Right Panel - Promotional Section */}
      <div className="promo-panel">
        <div className="promo-box">
          <img src="logo2.png" alt="Bob's Barber Shop Logo" />
          <p className="promo-text">Hi there, join our membership</p>
          <p className="promo-text">today and enjoy</p>
          <h1 className="promo-discount">15% OFF</h1>
          <p className="promo-text22">for your every cut</p>
          <p className="promo-signup">
            Don't have an account?{' '}
            <span onClick={openCreateMember} className="create-account-link">
              Create an account
            </span>
          </p>
        </div>
      </div>

      {/* Create Member Modal */}
      {isCreateMemberOpen && <CreateMember onClose={closeCreateMember} />}
    </div>
  );
}

export default MemberPage;