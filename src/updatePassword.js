const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// Database connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234', // Add your MySQL root password if needed
  database: 'barber_shop'
});

// Function to hash a password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Function to update the password for a specific user
const updatePassword = async (username, plainPassword) => {
  try {
    const hashedPassword = await hashPassword(plainPassword); // Hash the password
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE staff SET password = ? WHERE username = ?',
        [hashedPassword, username],
        (err, results) => {
          if (err) {
            console.error(`Error updating password for ${username}:`, err.message);
            reject(err);
          } else {
            console.log(`Password updated successfully for ${username}.`);
            resolve(results);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error hashing password:', error.message);
    throw error;
  }
};

// Main function to update passwords for multiple users
const updatePasswords = async () => {
  try {
    await updatePassword('admin', '1234'); // Update password for admin
    await updatePassword('haniff', '4321'); // Update password for haniff
  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    connection.end(); // Close the connection after all queries are completed
  }
};

// Run the script
updatePasswords();
