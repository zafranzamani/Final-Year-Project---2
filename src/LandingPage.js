import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation to other pages
import BookingModal from './BookingModal'; // Import the booking modal component
import './LandingPage.css';

function LandingPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const openBookingModal = () => {
    setIsBookingOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
  };

  // Set the background image path for bg1
  const backgroundImageStyle1 = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/bg1.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    maxHeight: '1200px',
    position: 'relative',
  };

  // Set the background image path for bg2
  const backgroundImageStyle2 = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/bg2.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    maxHeight: '1050px',
    position: 'relative',
  };

  return (
    <>
      <div className="landing-page" style={backgroundImageStyle1}>
        <div className="content" id="headline">
          <h1 className="headline">
            Fade <span className="highlight">Fresh</span>, Stay Fly.
          </h1>
          <button className="book-button" onClick={openBookingModal}>
            BOOK YOUR SESSION
          </button>
        </div>
        <div className="barbershop-info">
          <img
            src={`${process.env.PUBLIC_URL}/pic1.png`}
            alt="Barbershop"
            className="barbershop-image"
          />
          <div className="info-text">
            <h2>Open Tuesday - Sunday</h2>
            <p>Tue - Thu 10:00 AM - 12:00 PM</p>
            <p>Friday 10:00 AM - 1:00 PM, 3:00 PM - 12:00 PM</p>
            <p>Sat - Sun 10:00 AM - 12:00 PM</p>
            <div className="location-info">
              <img
                src={`${process.env.PUBLIC_URL}/location-icon.png`}
                alt="Location"
                className="location-icon"
              />
              <div>
                <p>12A, Persiaran Tembok, Taman Seri</p>
                <p>Desa, 30010 Ipoh, Perak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="additional-background" style={backgroundImageStyle2}>
        <div className="about-us">
          <div className="about-text">
            <h2>About Us</h2>
            <p>At Bob's Barbershop, we offer affordable, top-quality</p>
            <p>haircuts and grooming in a welcoming environment.</p>
            <p>Your needs are our top priority.</p>
            <button className="read-more-button">Read more</button>
          </div>
          <img
            src={`${process.env.PUBLIC_URL}/pic2.png`}
            alt="Barbershop Services"
            className="about-image"
          />
        </div>
        <div className="founder">
          <div className="founder-image">
            <img
              src={`${process.env.PUBLIC_URL}/founder-image.png`}
              alt="Founder"
              className="founder-pic"
            />
          </div>
          <div className="founder-info">
            <h2>Founder</h2>
            <p className="founder-name">Muhammad Amin</p>
            <p>
              “ Starting this barbershop has been a dream come true. I’ve worked
              hard to create a friendly and comfortable space where everyone
              leaves looking great. Thank you for supporting us! "
            </p>
            <Link to="/services">
              <button className="see-services-button">See Our Services</button>
            </Link>
          </div>
        </div>
      </div>
      {/* Render Booking Modal */}
      {isBookingOpen && <BookingModal onClose={closeBookingModal} />}
    </>
  );
}

export default LandingPage;
