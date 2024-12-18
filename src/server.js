const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Test Route
app.get('/', (req, res) => {
  res.send('Email Server is Running...');
});

// Email Endpoint
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  // Check if all fields are provided
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Configure Gmail SMTP (Use your credentials)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zafranzamani12@gmail.com', // Replace with your Gmail
      pass: 'gmscqdmncvvdtomf',    // Replace with your generated App Password
    },
    tls: {
      rejectUnauthorized: false, // Disable SSL certificate validation
    },
  });

  // Email options
  const mailOptions = {
    from: `Contact Form <${email}>`, // Set sender address
    to: 'zafranzamani12@gmail.com', // Replace with your receiving email
    subject: `New Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: `Failed to send email: ${error.message}` });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
