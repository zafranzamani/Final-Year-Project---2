import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import './BookingModal.css';

// Confirmation Modal Component
function BookingConfirmation({ bookingDetails, onClose }) {
    return (
        <div className="confirmation-overlay">
            <div className="confirmation-content">
                <h2 className="confirmation-title">Booking Confirmed! 🎉</h2>
                <div className="booking-details">
                    <p className="screenshot-notice">Please screenshot this confirmation for your records</p>
                    <div className="details-container">
                        <h3>Booking Details</h3>
                        <div className="detail-item">
                            <span className="detail-label">Booking ID:</span>
                            <span className="detail-value">{bookingDetails.bookingId}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{bookingDetails.name}</span>
                        </div>
                        {bookingDetails.memberId && (
                            <div className="detail-item">
                                <span className="detail-label">Member ID:</span>
                                <span className="detail-value">{bookingDetails.memberId}</span>
                            </div>
                        )}
                        <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{bookingDetails.email}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{bookingDetails.date}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Time:</span>
                            <span className="detail-value">{bookingDetails.time}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Barber:</span>
                            <span className="detail-value">{bookingDetails.barber}</span>
                        </div>
                    </div>
                    <button className="close-confirmation-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Booking Modal Component
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
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (value.trim() !== '') {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
        }

        if (name === 'barber' && formData.date) {
            fetchAvailableSlots(formData.date, value);
        }
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, date, time: '' });

        if (date) {
            setErrors((prevErrors) => ({ ...prevErrors, date: '' }));
            if (formData.barber) {
                fetchAvailableSlots(date, formData.barber);
            }
        }
    };

    const fetchAvailableSlots = async (date, barber) => {
        if (!date || !barber) return;

        setIsLoadingSlots(true);
        try {
            const formattedDate = date.toISOString().split('T')[0];
            const response = await axios.get(`http://localhost:8081/available-slots`, {
                params: {
                    date: formattedDate,
                    barber: barber
                }
            });
            setAvailableSlots(response.data.availableSlots);
        } catch (error) {
            console.error('Error fetching available slots:', error);
            alert('Failed to fetch available time slots. Please try again.');
        } finally {
            setIsLoadingSlots(false);
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

        try {
            const response = await axios.post('http://localhost:8081/', {
                ...formData,
                date: formData.date.toISOString().split('T')[0]
            });

            if (response.status === 200) {
                // Format the date for display
                const formattedDate = formData.date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // Set booking details for confirmation
                setBookingDetails({
                    bookingId: response.data.bookingId,
                    name: formData.name,
                    memberId: formData.memberId,
                    email: formData.email,
                    date: formattedDate,
                    time: formData.time,
                    barber: formData.barber
                });
                
                setShowConfirmation(true);
            }
        } catch (error) {
            if (error.response?.status === 409) {
                alert('This slot is no longer available. Please select another time.');
                fetchAvailableSlots(formData.date, formData.barber);
            } else {
                console.error('Error booking appointment:', error);
                alert('Booking failed. Please try again later.');
            }
        }
    };

    const handleConfirmationClose = () => {
        setShowConfirmation(false);
        onClose();
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <button className="close-button" onClick={onClose}>&times;</button>
                    <h2 className="modal-title">Book Your Session</h2>
                    <form onSubmit={handleSubmit}>
                        <label>Name <span className="required">*</span></label>
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

                        <label>Email address <span className="required">*</span></label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <p className="error-text">{errors.email}</p>}

                        <label>Select Barber <span className="required">*</span></label>
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

                        <label>Date <span className="required">*</span></label>
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

                        <label>Time <span className="required">*</span></label>
                        <div className="dropdown-container">
                            <select
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className={errors.time ? 'input-error' : ''}
                                required
                                disabled={isLoadingSlots || !formData.date || !formData.barber}
                            >
                                <option value="">
                                    {isLoadingSlots 
                                        ? 'Loading slots...' 
                                        : !formData.date || !formData.barber
                                        ? 'Select date and barber first'
                                        : 'Select Time'
                                    }
                                </option>
                                {availableSlots.map((slot) => (
                                    <option key={slot} value={slot}>{slot}</option>
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
            {showConfirmation && (
                <BookingConfirmation 
                    bookingDetails={bookingDetails}
                    onClose={handleConfirmationClose}
                />
            )}
        </>
    );
}

export default BookingModal;