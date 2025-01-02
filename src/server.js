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
    console.error('Backend error:', error); // Add this to log backend issues
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

app.get('/validate-member/:memberId', async (req, res) => {
  const { memberId } = req.params;

  try {
    // Check if member ID exists in users table
    const [user] = await db.query(
      'SELECT member_id FROM users WHERE member_id = ?',
      [memberId]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid Member ID' 
      });
    }

    res.json({ 
      valid: true, 
      message: 'Valid Member ID' 
    });
  } catch (error) {
    console.error('Error validating member ID:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Error checking member ID' 
    });
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
    from: 'Bob\'s Barber Shop <zafranzamani12@gmail.com>',
    to: email,
    subject: `Booking Confirmation for ${name}`,
    html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <!-- Header with Logo -->
            <div style="text-align: center; background-color: #a3825c; padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Bob's Barber Shop</h1>
                <p style="color: white; margin: 10px 0 0;">Booking Confirmation</p>
            </div>

            <!-- Main Content -->
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Thank you for your booking!</h2>
                
                <!-- Booking Details -->
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="color: #a3825c; margin-top: 0;">Booking Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #666;">Name:</strong>
                            </td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                                ${name}
                            </td>
                        </tr>
                        ${memberId ? `
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #666;">Member ID:</strong>
                            </td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                                ${memberId}
                            </td>
                        </tr>
                        ` : ''}
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #666;">Barber:</strong>
                            </td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                                ${barber}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                                <strong style="color: #666;">Date:</strong>
                            </td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                                ${date}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;">
                                <strong style="color: #666;">Time:</strong>
                            </td>
                            <td style="padding: 8px 0;">
                                ${time}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Important Notes -->
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 30px;">
                    <h3 style="color: #856404; margin-top: 0;">Important Notes</h3>
                    <ul style="color: #856404; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 10px;">If you arrive more than 10 minutes late, your appointment will be <strong>canceled</strong>.</li>
                        <li style="margin-bottom: 10px;">Please arrive a few minutes early to ensure a smooth experience.</li>
                        <li style="margin-bottom: 10px;">Mark your calendar with the booking date and time.</li>
                        <li>If you need to make changes, please contact us as soon as possible.</li>
                    </ul>
                </div>

                <!-- Contact Info -->
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f8f9fa;">
                    <p style="color: #666; margin-bottom: 5px;">Need help? Contact us:</p>
                    <p style="color: #a3825c; margin-top: 0;">
                        <strong>Phone:</strong> (555) 123-4567<br>
                        <strong>Email:</strong> zafranzamani12@gmail.com
                    </p>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </div>
    `
};

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Booking confirmation email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send booking confirmation email.' });
  }
});

const sendConfirmationEmail = async (userData, memberId) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zafranzamani12@gmail.com',
      pass: 'gmscqdmncvvdtomf',
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: 'Bob\'s Barber Shop <zafranzamani12@gmail.com>',
    to: userData.email,
    subject: 'Welcome to Bob\'s Barber Shop - Membership Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; text-align: center;">Welcome to Bob's Barber Shop!</h1>
        
        <p style="color: #666; font-size: 16px;">Dear ${userData.username},</p>
        
        <p style="color: #666; font-size: 16px;">Thank you for becoming a member of Bob's Barber Shop. We're excited to have you join our community!</p>
        
        <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="color: #555; margin-bottom: 10px; font-weight: bold;">Your Member ID:</p>
          <h2 style="color: #2c3e50; margin: 0; letter-spacing: 2px;">${memberId}</h2>
        </div>
        
        <h3 style="color: #2c3e50;">Membership Benefits:</h3>
        <ul style="color: #666; font-size: 16px;">
          <li>15% discount on all services as a Silver member</li>
          <li>Exclusive access to member-only promotions</li>
          <li>Priority booking</li>
          <li>Opportunity to upgrade to Gold membership</li>
        </ul>
        
        <p style="color: #666; font-size: 16px;">Keep your Member ID handy when booking appointments to receive your discounts.</p>
        
        <p style="color: #666; font-size: 16px;">If you have any questions, feel free to contact us.</p>
        
        <p style="color: #666; font-size: 16px;">Best regards,<br>Bob's Barber Shop Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

// Update the register endpoint to include email sending
app.post('/register', async (req, res) => {
  try {
    const { username, email, phoneNumber, password, confirmPassword } = req.body;

    // Validate the input
    if (!username || !email || !phoneNumber || !password || password !== confirmPassword) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ? OR phone_number = ?',
      [username, email, phoneNumber]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        error: 'Username, email, or phone number already exists' 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert member data into database
    const [result] = await db.query(
      `INSERT INTO users (username, email, phone_number, password) 
       VALUES (?, ?, ?, ?)`,
      [username, email, phoneNumber, hashedPassword]
    );

    // Get the generated member_id
    const [newUser] = await db.query(
      'SELECT member_id FROM users WHERE id = ?',
      [result.insertId]
    );

    // Send confirmation email
    await sendConfirmationEmail(
      { username, email }, 
      newUser[0].member_id
    );

    res.status(201).json({ 
      message: 'Registration successful!',
      memberId: newUser[0].member_id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.' 
    });
  }
});

// Add this new endpoint in server.js
app.get('/validate-member/:memberId', async (req, res) => {
  const { memberId } = req.params;

  try {
    // Check if member ID exists in users table
    const [user] = await db.query(
      'SELECT member_id FROM users WHERE member_id = ?',
      [memberId]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid Member ID' 
      });
    }

    res.json({ 
      valid: true, 
      message: 'Valid Member ID' 
    });
  } catch (error) {
    console.error('Error validating member ID:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Error checking member ID' 
    });
  }
});

// Then modify your book-session endpoint
app.post("/book-session", async (req, res) => {
  const { name, memberId, email, barber, date, time } = req.body;

  if (!name || !email || !barber || !date || !time) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Validate memberId if provided
    if (memberId) {
      const [user] = await db.query(
        "SELECT member_id FROM users WHERE member_id = ?",
        [memberId]
      );

      if (user.length === 0) {
        return res.status(400).json({ error: "Invalid Member ID." });
      }
    }

    const normalizedDate = new Date(date).toISOString().split("T")[0];

    // Check for conflicting slots
    const [conflicts] = await db.query(
      "SELECT COUNT(*) AS count FROM booking WHERE date = ? AND time = ? AND barber = ?",
      [normalizedDate, time, barber]
    );

    if (conflicts[0].count > 0) {
      return res.status(409).json({ error: "Time slot is already booked." });
    }

    const [result] = await db.query(
      "INSERT INTO booking (name, memberId, email, barber, date, time) VALUES (?, ?, ?, ?, ?, ?)",
      [name, memberId || null, email, barber, normalizedDate, time]
    );

    res.status(201).json({ message: "Booking successful.", bookingId: result.insertId });
  } catch (error) {
    console.error("Error booking session:", error.message);
    res.status(500).json({ error: "Internal server error." });
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
  
  app.post('/add-product', async (req, res) => {
    const { item_name, category, supplier_name, purchase_rate, in_stock } = req.body;
  
    // Log incoming request
    console.log('Incoming request:', req.body);
  
    // Validate request body
    if (!item_name || !category || !supplier_name || !purchase_rate || !in_stock) {
      console.error('Missing fields in request body');
      return res.status(400).json({ error: 'Missing fields in request body' });
    }
  
    try {
      // Insert product into database
      const [result] = await db.query(
        `INSERT INTO product (item_name, category, supplier_name, purchase_rate, in_stock) VALUES (?, ?, ?, ?, ?)`,
        [item_name, category, supplier_name, purchase_rate, in_stock]
      );
  
      // Log successful insertion
      console.log(`Product added successfully with ID: ${result.insertId}`);
  
      // Respond with success message
      return res.status(201).json({
        message: 'Product added successfully.',
        productId: result.insertId,
      });
    } catch (error) {
      console.error('Error adding product:', error.message);
      return res.status(500).json({ error: 'Failed to add product' });
    }
  });
  
  
app.get('/product', async (req, res) => {
  try {
    const [product] = await db.query('SELECT * FROM product ORDER BY created_at DESC');
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/update-product/:id', async (req, res) => {
  const { id } = req.params;
  const { purchase_rate, in_stock } = req.body;
  console.log("Update Request:", { id, purchase_rate, in_stock });

  if (!purchase_rate || !in_stock) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  try {
    const [result] = await db.query(
      'UPDATE product SET purchase_rate = ?, in_stock = ? WHERE id = ?',
      [purchase_rate, in_stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/delete-product/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Deleting product with ID:', id);

  try {
    const [result] = await db.query('DELETE FROM product WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/get-product/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM product WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint for member registration
app.post('/register', async (req, res) => {
  try {
    const { username, email, phoneNumber, password, confirmPassword } = req.body;

    // Validate the input
    if (!username || !email || !phoneNumber || !password || password !== confirmPassword) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ? OR phone_number = ?',
      [username, email, phoneNumber]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        error: 'Username, email, or phone number already exists' 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert member data into database
    const [result] = await db.query(
      `INSERT INTO users (username, email, phone_number, password) 
       VALUES (?, ?, ?, ?)`,
      [username, email, phoneNumber, hashedPassword]
    );

    // Get the generated member_id
    const [newUser] = await db.query(
      'SELECT member_id FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ 
      message: 'Registration successful!',
      memberId: newUser[0].member_id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.' 
    });
  }
});

// Member Login Endpoint
app.post('/member-login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    // Get user from database
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = users[0];
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update refresh token in database
    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    res.status(200).json({ 
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        memberId: user.member_id
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// Update user name
app.put('/update-user-name', async (req, res) => {
  const { id, name } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Name updated successfully' });
  } catch (error) {
    console.error('Error updating name:', error);
    res.status(500).json({ error: 'Failed to update name' });
  }
});

// Update user details (phone, username, password)
app.get('/user-details/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await db.query(
      `SELECT 
        id,
        username,
        email,
        phone_number,
        name,
        member_id,
        membership,
        membership_start_date,
        membership_valid_until,
        discount_percentage,
        booking_count
      FROM users 
      WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send password or sensitive data
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});


// Add this new endpoint to verify password
app.post('/verify-password', async (req, res) => {
  const { id, password } = req.body;
  
  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, rows[0].password);
    
    res.json({ 
      valid: isPasswordValid,
      currentPassword: isPasswordValid ? password : null 
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Failed to verify password' });
  }
});

app.put('/update-user-details', async (req, res) => {
  const { id, field, value } = req.body;

  if (!id || !field || value === undefined) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const allowedFields = ['phone_number', 'username', 'password'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ error: 'Invalid field for update.' });
  }

  try {
    if (field === 'password') {
      const hashedPassword = await bcrypt.hash(value, 10);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    } else {
      await db.query(`UPDATE users SET ${field} = ? WHERE id = ?`, [value, id]);
    }

    res.json({ message: `${field.replace('_', ' ')} updated successfully.` });
  } catch (error) {
    console.error(`Error updating ${field}:`, error.message);
    res.status(500).json({ error: `Failed to update ${field}.` });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
