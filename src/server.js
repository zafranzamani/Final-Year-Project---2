const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db').db; // Import only the pool
const router = express.Router();
const app = express();
const PORT = 5000;

const { body, validationResult } = require('express-validator');

// JWT Secret Keys
const JWT_SECRET = 'your_jwt_secret_key';
const REFRESH_SECRET = 'your_refresh_secret_key';

// Helper Functions for JWT
function generateAccessToken(user) {
  return jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '30m' });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '1h' });
}

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('Email Server is Running...');
});

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Staff Login
app.post('/staff-login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required.' });

  try {
    const [rows] = await db.query('SELECT * FROM staff WHERE username = ?', [username]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid username or password.' });

    const staff = rows[0];
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: 'Invalid username or password.' });

    const accessToken = generateAccessToken(staff);
    const refreshToken = generateRefreshToken(staff);

    await db.query('UPDATE staff SET refresh_token = ? WHERE id = ?', [refreshToken, staff.id]);
    res.status(200).json({ message: 'Login successful.', accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// Refresh Token
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required.' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const [rows] = await db.query('SELECT * FROM staff WHERE id = ? AND refresh_token = ?', [
      decoded.id,
      refreshToken,
    ]);

    if (rows.length === 0)
      return res.status(403).json({ error: 'Invalid refresh token.' });

    const user = rows[0];
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Failed to refresh token.' });
  }
});

// Dashboard Route
app.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM staff WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    res.json({ message: 'Welcome to the dashboard.', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user information.' });
  }
});

// Contact Form Email
app.post('/send-contact-email', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).json({ error: 'All fields are required.' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zafranzamani12@gmail.com',
      pass: 'gmscqdmncvvdtomf',
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: `${name} <${email}>`,
    to: 'zafranzamani12@gmail.com',
    subject: `New Contact Form Message from ${name}`,
    text: `Message: ${message}\n\nFrom: ${name} <${email}>`,
    html: `<h1>New Contact Form Submission</h1>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong> ${message}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Contact form email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send contact form email.' });
  }
});

// Booking Confirmation Email
app.post('/send-email', async (req, res) => {
  const { name, memberId, email, barber, date, time } = req.body;

  if (!name || !email || !barber || !date || !time)
    return res.status(400).json({ error: 'All fields are required.' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zafranzamani12@gmail.com',
      pass: 'gmscqdmncvvdtomf',
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: `Bob's Barber Shop <zafranzamani12@gmail.com>`,
    to: email,
    subject: `Booking Confirmation for ${name}`,
    html: `<h1>Booking Confirmation</h1>
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
           <p>Looking forward to serving you!</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Booking confirmation email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send booking confirmation email.' });
  }
});


// Book Session
app.post('/book-session', async (req, res) => {
  const { name, memberId, email, barber, date, time } = req.body;

  console.log('Time received from frontend:', time); // Debug the time value


  if (!name || !email || !barber || !date || !time)
    return res.status(400).json({ error: 'All fields are required.' });

  try {
    // Normalize the date to ensure consistency
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    
    // Check slot availability
    const [rows] = await db.query(
    `SELECT COUNT(*) AS count FROM booking WHERE date = ? AND time = ? AND barber = ?`,
    [normalizedDate, time, barber]
    );

    if (rows[0].count > 0) return res.status(409).json({ error: 'Slot is already booked.' });

    // Insert booking into the database
    const [result] = await db.query(
    `INSERT INTO booking (name, memberId, email, barber, date, time) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, memberId, email, barber, normalizedDate, time]
    );

    res.status(201).json({ message: 'Booking successful!', bookingId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error.' });
  }
});


app.get('/available-slots', async (req, res) => {
    const { date, barber } = req.query;
  
    console.log("Received Date:", date); // Should match normalizedDate from frontend
    console.log("Received Barber:", barber);
  
    if (!date || !barber) {
      return res.status(400).json({ error: "Date and Barber are required." });
    }
  
    try {
      const allSlots = [
        '11:40 AM', '12:20 PM', '1:00 PM', '1:40 PM', '2:20 PM',
        '3:00 PM', '3:40 PM', '4:20 PM', '5:00 PM', '5:40 PM',
        '6:20 PM', '7:00 PM', '8:20 PM', '9:00 PM', '9:40 PM',
        '10:20 PM', '11:00 PM', '11:40 PM', '12:20 AM', '1:00 AM',
      ];
  
      const [rows] = await db.query(
        `SELECT time FROM booking WHERE date = ? AND barber = ?`,
        [date, barber]
      );
  
      const bookedSlots = rows.map((row) => row.time);
      const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
  
      console.log("Available Slots:", availableSlots);
      res.json({ availableSlots });
    } catch (error) {
      console.error("Error fetching available slots:", error.message);
      res.status(500).json({ error: "Internal Server Error." });
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
        'INSERT INTO announcement (text, created_at) VALUES (?, ?)',
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
