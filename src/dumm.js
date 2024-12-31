const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myproject_db',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the MySQL database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Get available slots for a specific date and barber
app.get('/available-slots', (req, res) => {
    const { date, barber } = req.query;
    
    // Get all booked slots for the selected date and barber
    const query = `
        SELECT time 
        FROM booking 
        WHERE DATE(date) = DATE(?) 
        AND barber = ?
    `;
    
    db.query(query, [date, barber], (err, results) => {
        if (err) {
            console.error('Error fetching booked slots:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        
        // Define all possible time slots
        const allSlots = [
            '11:40 AM', '12:20 PM', '1:00 PM', '1:40 PM', '2:20 PM',
            '3:00 PM', '3:40 PM', '4:20 PM', '5:00 PM', '5:40 PM',
            '6:20 PM', '7:00 PM', '8:20 PM', '9:00 PM', '9:40 PM',
            '10:20 PM', '11:00 PM', '11:40 PM', '12:20 AM', '1:00 AM'
        ];
        
        // Filter out booked slots
        const bookedSlots = results.map(row => row.time);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        
        res.json({ availableSlots });
    });
});

// Book appointment
app.post('/', async (req, res) => {
    const { name, memberId, email, date, time, barber } = req.body;

    // Check if slot is still available
    const checkQuery = `
        SELECT COUNT(*) as count 
        FROM booking 
        WHERE date = ? 
        AND time = ? 
        AND barber = ?
    `;

    db.query(checkQuery, [date, time, barber], (err, results) => {
        if (err) {
            console.error('Error checking slot availability:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results[0].count > 0) {
            return res.status(409).json({ error: 'Slot no longer available.' });
        }

        // If slot is available, proceed with booking
        const insertQuery = `
            INSERT INTO booking (name, memberId, email, date, time, barber)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [name, memberId, email, date, time, barber], (err, result) => {
            if (err) {
                console.error('Error inserting booking data:', err);
                return res.status(500).json({ error: 'Database insert failed.' });
            }
            res.status(200).json({ 
                message: 'Booking successful!',
                bookingId: result.insertId 
            });
        });
    });
});
















// Endpoint for member registration
app.post('/register', async (req, res) => {
    const { username, email, phoneNumber, password, confirmPassword } = req.body;

    // Validate the input
    if (!username || !email || !phoneNumber || !password || password !== confirmPassword) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert member data into 'user' table
    const insertQuery = `
        INSERT INTO user (username, email, phoneNumber, password, membership, memberId)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const memberId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit member ID
    const membership = 'silver'; // Initial membership is 'silver'

    db.query(insertQuery, [username, email, phoneNumber, hashedPassword, membership, memberId], (err, result) => {
        if (err) {
            console.error('Error inserting user data:', err);
            return res.status(500).json({ error: 'Database insert failed.' });
        }
        res.status(200).json({ 
            message: 'Registration successful!',
            memberId: memberId
        });
    });
});


app.listen(8081, () => {
    console.log("Server is running on port 8081...");
});