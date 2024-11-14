import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Wrap here
import App from './App'; // Your App component
import './index.css'; // If you have any global styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router> {/* Wrap the entire app here */}
    <App />
  </Router>
);
