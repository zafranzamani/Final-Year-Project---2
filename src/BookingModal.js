import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
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
  const [loading, setLoading] = useState(false); // Add loading state

  const [availableSlots] = useState([
    '11:40 AM', '12:20 PM', '1:00 PM', '1:40 PM', '2:20 PM',
    '3:00 PM', '3:40 PM', '4:20 PM', '5:00 PM', '5:40 PM',
    '6:20 PM', '7:00 PM', '8:20 PM', '9:00 PM', '9:40 PM',
    '10:20 PM', '11:00 PM', '11:40 PM', '12:20 AM', '1:00 AM',
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (value.trim() !== '') {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });

    if (date) {
      setErrors((prevErrors) => ({ ...prevErrors, date: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    if (!formData.date) newErrors.date = 'Date is required.';
    if (!formData.barber) newErrors.barber = 'Barber selection is required.';
    if (!formData.time) newErrors.time = 'Time is required.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true); // Show loading animation

    try {
      const response = await fetch('http://localhost:5000/send-email', {
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
  
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
  
      const result = await response.json();
      console.log('Email sent successfully:', result.message);
      setIsConfirmationVisible(true); // Show the confirmation popup
    } catch (error) {
      console.error('Error during booking submission:', error.message);
      alert('Failed to book your session. Please try again.');
    } finally {
      setLoading(false); // Hide loading animation
    }
  };

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

  const sendConfirmationEmail = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Simulated email sent successfully.');
        resolve();
      }, 1000); // Simulate a 1-second delay
    });
  };

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

          <label>Member ID</label>
          <input
            type="text"
            name="memberId"
            placeholder="Your Member ID"
            value={formData.memberId}
            onChange={handleChange}
          />

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
              onChange={handleChange}
              className={errors.barber ? 'input-error' : ''}
              required
            >
              <option value="">Select Barber</option>
              <option value="barber1">Barber 1</option>
              <option value="barber2">Barber 2</option>
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
