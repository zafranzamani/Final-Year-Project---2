import React from 'react';
import './ServicePage.css';

function ServicePage() {
  return (
    <div className="service-page">
      <div className="service-header">
        <h1>Our Services</h1>
        <p>From classic cuts to the latest trends, our barbers are skilled in every style. </p> 
        <p> Plus, we offer straight razor shaves for extra smooth finish.</p>
      </div>
      <div className="service-cards">
        <div className="service-card">
          <h2>HAIRCUT</h2>
          <p>Get a stylish cut that's just right for you.</p>
        </div>
        <div className="service-card">
          <h2>WASH AND HAIRCUT</h2>
          <p>Get a fresh cut and a clean wash all in one.</p>
        </div>
        <div className="service-card">
          <h2>HOT TOWEL CLEAN SHAVE</h2>
          <p>Enjoy a smooth shave with a soothing hot towel.</p>
        </div>
        <div className="service-card">
          <h2>JUNIOR HAIRCUT</h2>
          <p>Cuts for kids under 12, get your kids ready for school.</p>
        </div>
      </div>
      <div className="book-button-container">
        <button className="book-button">BOOK YOUR CUT NOW</button>
      </div>
    </div>
  );
}

export default ServicePage;
