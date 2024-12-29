import React, { useState } from 'react';
import './CreateMember.css';

function CreateMember({ onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (value.trim() !== '') {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = 'Phone number is required.';
    if (!formData.password.trim()) newErrors.password = 'Password is required.';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';
    if (!formData.termsAccepted)
      newErrors.termsAccepted = 'You must accept the terms and conditions.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log('Registration successful:', formData);
    alert('Registration successful!');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-member">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h1>Create Your</h1>
        <h1>Membership Account</h1>
        <p>and get the discount!</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group-member">
            <i className="user-icon"></i>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'input-error-member' : ''}
            />
          </div>
          {errors.username && <p className="error-text-member">{errors.username}</p>}

          <div className="input-group-member">
            <i className="email-icon"></i>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
          </div>
          {errors.email && <p className="error-text-member">{errors.email}</p>}

          <div className="input-group-member">
            <i className="phone-icon"></i>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? 'input-error' : ''}
            />
          </div>
          {errors.phoneNumber && (
            <p className="error-text-member">{errors.phoneNumber}</p>
          )}

          <div className="input-group-member">
            <i className="lock-icon"></i>
            <input
              type="text"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
            />
          </div>
          {errors.password && <p className="error-text-member">{errors.password}</p>}

          <div className="input-group-member">
            <i className="lock-icon"></i>
            <input
              type="text"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'input-error' : ''}
            />
          </div>
          {errors.confirmPassword && (
            <p className="error-text-member">{errors.confirmPassword}</p>
          )}

          <div className="terms">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            <label>
              Accept{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                terms and conditions
              </a>
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="error-text-member-1">{errors.termsAccepted}</p>
          )}

          <button type="submit" className="register-button">
            REGISTER
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateMember;
