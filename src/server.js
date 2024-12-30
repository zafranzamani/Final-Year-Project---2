const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const db = require('./db').db; // Import only the pool


const app = express();
const PORT = 5000;
const { body, validationResult } = require('express-validator');

// Secret Key for JWT
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure secret key
const REFRESH_SECRET = 'your_refresh_secret_key'; // Secret for the refresh token

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '30m' }); // Access token expires in 5 seconds
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '1h' }); // Refresh token expires in 15 minutes
}

// Middleware
app.use(bodyParser.json());
app.use(cors());


// Test Route
app.get('/', (req, res) => {
  res.send('Email Server is Running...');
});

// Test the database connection

// Staff login
app.post('/staff-login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('Missing username or password');
      return res.status(400).json({ error: 'username and password are required.' });
  }

  try {
      console.log('Checking user in database...');
      const [rows] = await db.query('SELECT * FROM staff WHERE username = ?', [username]);

      if (rows.length === 0) {
          return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const staff = rows[0];
      const isPasswordValid = await bcrypt.compare(password, staff.password);

      if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid username or password.' });
      }

      // Generate access and refresh tokens
    const accessToken = generateAccessToken({ id: staff.id, name: staff.name });
    const refreshToken = generateRefreshToken(staff);

    // Store refresh token in the database
    console.log('Storing refresh token...');
    await db.query('UPDATE staff SET refresh_token = ? WHERE id = ?', [refreshToken, staff.id]);

      res.status(200).json({ message: 'Login successful.',  accessToken, refreshToken });
  } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ error: 'Failed to login.' });
  }
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request object
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token or expired token.' });
  }
};

app.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM staff WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = rows[0];
    res.json({ message: 'Welcome to the dashboard.', user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user information.' });
  }
});

app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Verify if the refresh token exists in the database
    const [rows] = await db.query('SELECT * FROM staff WHERE id = ? AND refresh_token = ?', [decoded.id, refreshToken]);
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Invalid refresh token.' });
    }

    // Generate a new access token
    const user = rows[0];
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Error during refresh token:', error.message);
    if (error.name === 'TokenExpiredError') {
        // Clear expired refresh token from the database
      
        return res.status(403).json({ error: 'Refresh token expired. Please log in again.' });
    }
    res.status(403).json({ error: 'Failed to refresh token.' });
  }
});

// Contact Form Email Endpoint
app.post('/send-contact-email', async (req, res) => {
  const { name, email, message } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Configure Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zafranzamani12@gmail.com', // Replace with your Gmail
      pass: 'gmscqdmncvvdtomf', // Replace with your generated App Password
    },
    tls: {
      rejectUnauthorized: false, // Disable SSL certificate validation
    },
  });

  // Email content
  const mailOptions = {
    from: `${name} <${email}>`, // Customer's email
    to: 'zafranzamani12@gmail.com', // Your receiving email
    subject: `New Contact Form Message from ${name}`,
    text: `Message: ${message}\n\nFrom: ${name} <${email}>`,
    html: `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent:', info.messageId);
    res.status(200).json({ message: 'Contact form email sent successfully!' });
  } catch (error) {
    console.error('Error sending contact form email:', error.message);
    res.status(500).json({ error: 'Failed to send contact form email.' });
  }
});

// Booking Confirmation Email Endpoint
app.post('/send-email', async (req, res) => {
  const { name, memberId, email, barber, date, time } = req.body;

  if (!name || !email || !barber || !date || !time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zafranzamani12@gmail.com',
      pass: 'gmscqdmncvvdtomf',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `Bob's Barber Shop <zafranzamani12@gmail.com>`,
    to: email,
    subject: `Booking Confirmation for ${name}`,
    html: `
      <h1>Booking Confirmation</h1>
      <p>Thank you for booking with Bob's Barber Shop!</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Member ID:</strong> ${memberId || 'N/A'}</p>
      <p><strong>Barber:</strong> ${barber}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <br />
      <h3>Note:</h3>
      <ul>
        <li>If you do not arrive more than 10 minutes late, your appointment will be <strong>canceled</strong>.</li>
        <li>Mark your calendar with the booking date and time.</li>
        <li>Arrive a few minutes early to ensure everything goes smoothly.</li>
        <li>If you have any questions or need to make changes, feel free to reach out.</li>
      </ul>
      <br />
      <p>Looking forward to serving you!</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Booking email sent:', info.messageId);
    res.status(200).json({ message: 'Booking confirmation email sent successfully!' });
  } catch (error) {
    console.error('Error sending booking email:', error.message);
    res.status(500).json({ error: 'Failed to send booking confirmation email.' });
  }
});

let announcements = [];

// Get Announcements
app.get('/announcements', async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT id, text, created_at FROM announcement ORDER BY created_at DESC`
    );
    res.json(results);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Post Announcement
app.post('/announcements', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Announcement text is required.' });
  }

  try {
    const [results] = await db.query(
      'INSERT INTO announcement (text, created_at) VALUES (?, NOW())',
      [text]
    );
    const [announcement] = await db.query('SELECT * FROM announcement WHERE id = ?', [results.insertId]);
    res.status(201).json(announcement[0]);
  } catch (err) {
    console.error('Error saving announcement:', err);
    res.status(500).send('Internal Server Error');
  }
});



// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


