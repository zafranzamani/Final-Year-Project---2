import React, { useState } from 'react';
import './ServicePage.css'; // Reuse ServicePage.css for styling

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' }); // Reset the form
      } else {
        alert('Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending the message.');
    }
  };  

  const handleWhatsApp = () => {
    const whatsappMessage = `Hello! My name is ${formData.name}. ${formData.message}`;
    const whatsappLink = `https://wa.me/60163447022?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-form">
          <h1>Contact us</h1>
          <p>
            Need more information or have questions? We're here to help! Reach out to us, and we'll be happy to assist
            you.
          </p>
          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Your Name"
            />
            <label>Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Your Email Address"
            />
            <label>Your message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder="Enter your question or message"
            />
            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
          <p>OR</p>
          <button type="button" onClick={handleWhatsApp} className="whatsapp-button">
            WhatsApp us!
          </button>
        </div>
        <div className="contact-image">
          <img src={`${process.env.PUBLIC_URL}/contact-image.png`} alt="Barbershop Interior" />
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
