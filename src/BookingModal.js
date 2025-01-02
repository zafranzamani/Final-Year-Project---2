import React, { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingModal.css';

function BookingModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    memberId: '',
    email: '',
    barber: '',
    date: null,
    time: '',
  });

  const [errors, setErrors] = useState({});
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [memberIdError, setMemberIdError] = useState('');
  const [isValidatingMemberId, setIsValidatingMemberId] = useState(false);

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const validateMemberId = async (id) => {
    // Clear error immediately if input is empty or backspaced
    if (!id || id.trim() === '') {
      setMemberIdError('');
      setIsValidatingMemberId(false);
      return;
    }

    setIsValidatingMemberId(true);
    try {
      const response = await axios.get(`http://localhost:5000/validate-member/${id}`);
      if (response.data.valid) {
        setMemberIdError('');
      } else {
        setMemberIdError('Invalid Member ID');
      }
    } catch (error) {
      setMemberIdError('Invalid Member ID');
    } finally {
      setIsValidatingMemberId(false);
    }
  };

  // Create debounced version of validation
  const debouncedValidation = useCallback(
    debounce(validateMemberId, 500),
    []
  );

// Update handleChange to clear member ID error when input is empty
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });

  if (name === 'memberId') {
    // Clear error immediately if the field is empty
    if (!value || value.trim() === '') {
      setMemberIdError('');
      setIsValidatingMemberId(false);
    } else {
      // Only validate if there's a value
      debouncedValidation(value);
    }
  }

  // Clear other form errors
  if (value.trim() !== '') {
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  }
};

  const fetchAvailableSlots = async (date, barber) => {
    if (!date || !barber) return;
    
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const normalizedDate = localDate.toISOString().split('T')[0];

    try {
      const response = await fetch(
        `http://localhost:5000/available-slots?date=${normalizedDate}&barber=${barber}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available slots.');
      }

      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error.message);
    }
  };

  const handleBarberChange = (e) => {
    const barber = e.target.value;
    setFormData({ ...formData, barber });

    if (barber) {
      setErrors((prevErrors) => ({ ...prevErrors, barber: '' }));
    }

    fetchAvailableSlots(formData.date, barber);
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });

    if (date) {
      setErrors((prevErrors) => ({ ...prevErrors, date: '' }));
    }

    fetchAvailableSlots(date, formData.barber);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    if (!formData.date) newErrors.date = 'Date is required.';
    if (!formData.barber) newErrors.barber = 'Barber selection is required.';
    if (!formData.time) newErrors.time = 'Time is required.';
    if (formData.memberId && memberIdError) newErrors.memberId = memberIdError;
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const bookingDate = new Date(formData.date);
      const adjustedDate = new Date(bookingDate.getTime() - bookingDate.getTimezoneOffset() * 60000);

      const bookingResponse = await fetch('http://localhost:5000/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          memberId: formData.memberId || null,
          email: formData.email,
          barber: formData.barber,
          date: adjustedDate.toISOString().split('T')[0],
          time: formData.time,
        }),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.error || 'Failed to save booking.');
      }

      const emailResponse = await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          memberId: formData.memberId,
          email: formData.email,
          barber: formData.barber,
          date: formData.date.toLocaleDateString(),
          time: formData.time,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send confirmation email.');
      }

      setIsConfirmationVisible(true);
    } catch (error) {
      console.error('Error:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your render code remains the same...
  if (loading) {
    return (
      <div className="loading-modal-overlay">
        <div className="loading-modal-content">
          <div className="spinner"></div>
          <p>Sending your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (isConfirmationVisible) {
    return (
      <div className="confirmation-modal-overlay">
        <div className="confirmation-modal-content">
          <div className="success-icon">
            <i className="check-icon">✔</i>
          </div>
          <h2 className="confirmation-heading">Congratulations!</h2>
          <p className="confirmation-message">Your booking is complete.</p>
          <p className="confirmation-message">Check your email for the details.</p>
          <div className="confirmation-note">
            <strong>Note:</strong>
            <ul>
              <li>
                If you do not arrive more than 10 minutes, your appointment will
                be <span>canceled</span>.
              </li>
              <li>Mark your calendar with the booking date and time.</li>
              <li>
                Arrive a few minutes early to ensure everything goes smoothly.
              </li>
              <li>
                If you have any questions or need to make changes, feel free to
                reach out.
              </li>
            </ul>
          </div>
          <button className="confirmation-home-button" onClick={onClose}>
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Book Your Session</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}

          <div className="form-group">
            <label>Member ID
            <input
              type="text"
              name="memberId"
              placeholder="Become a member and get a discount"
              value={formData.memberId}
              onChange={handleChange}
              className={memberIdError ? 'input-error' : ''}
            />
          </label>
            {isValidatingMemberId && (
              <span className="validating-text">Checking member ID...</span>
            )}
            {memberIdError && (
              <p className="error-text-memberId">{memberIdError}</p>
            )}
          </div>

          <label>
            Email address <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Your Email Address"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <label>
            Select Barber <span className="required">*</span>
          </label>
          <div className="dropdown-container">
            <select
              name="barber"
              value={formData.barber}
              onChange={handleBarberChange}
              className={errors.barber ? 'input-error' : ''}
              required
            >
              <option value="">Select Barber</option>
              <option value="Amin">Amin</option>
              <option value="Azmir">Azmir</option>
            </select>
            <span className="dropdown-icon">▼</span>
          </div>
          {errors.barber && <p className="error-text">{errors.barber}</p>}

          <label>
            Date <span className="required">*</span>
          </label>
          <div className="date-picker-container">
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select Date"
              className={`custom-date-picker ${errors.date ? 'input-error' : ''}`}
              showPopperArrow={false}
            />
            <img
              src={`${process.env.PUBLIC_URL}/calendar-icon.png`}
              alt="Calendar"
              className="calendar-icon"
              onClick={() => document.querySelector('.custom-date-picker').focus()}
            />
          </div>
          {errors.date && <p className="error-text">{errors.date}</p>}

          <label>
            Time <span className="required">*</span>
          </label>
          <div className="dropdown-container">
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={errors.time ? 'input-error' : ''}
              required
            >
              <option value="">Select Time</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <span className="dropdown-icon">▼</span>
          </div>
          {errors.time && <p className="error-text">{errors.time}</p>}

          <button type="submit" className="small-book-button">
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;