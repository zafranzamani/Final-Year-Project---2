require('dotenv').config();
const mysql = require('mysql2/promise'); // Use the promise-based version

// Validate environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    throw new Error('Database configuration is missing in the environment variables.');
}

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test the database connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database successfully.');
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    }
})();

// Hash password function
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Verify password function
async function verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

// Export both the pool and functions
module.exports = {
    db: pool, // Export the pool directly for async/await usage
    hashPassword,
    verifyPassword,
};
