import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingModal.css';

function BookingModal({ onClose }) {
  const [time, setTime] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date()); // Current time reference
  const [formData, setFormData] = useState({
    name: '',
    memberId: '',
    email: '',
    date: null,
    time: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 40); // Add 40 minutes
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    setTime(now);
    setFormattedTime(now.toLocaleTimeString([], options));
    setFormData((prev) => ({ ...prev, time: now.toLocaleTimeString([], options) }));
    setCurrentTime(new Date()); // Store current time
  }, []);

  const incrementTime = () => {
    const newTime = new Date(time.getTime());
    newTime.setMinutes(newTime.getMinutes() + 40);
    setTime(newTime);
    const newFormattedTime = newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setFormattedTime(newFormattedTime);
    setFormData((prev) => ({ ...prev, time: newFormattedTime }));
  };

  const decrementTime = () => {
    const newTime = new Date(time.getTime());
    newTime.setMinutes(newTime.getMinutes() - 40);

    // Prevent going below the allowed time limit
    if (newTime < currentTime) return;

    setTime(newTime);
    const newFormattedTime = newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setFormattedTime(newFormattedTime);
    setFormData((prev) => ({ ...prev, time: newFormattedTime }));
  };

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
    if (!formData.time.trim()) newErrors.time = 'Time is required.';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Booking Data:', formData, 'Time:', formattedTime);
    alert('Booking successful!');
    onClose();
  };

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
          <div className="time-picker">
            <button type="button" className="time-button" onClick={decrementTime}>
              &lt;
            </button>
            <input type="text" value={formattedTime} readOnly className={errors.time ? 'input-error' : ''} />
            <button type="button" className="time-button" onClick={incrementTime}>
              &gt;
            </button>
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
