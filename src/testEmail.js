const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password', // Replace with your app password
  },
});

const mailOptions = {
  from: 'your-email@gmail.com',
  to: 'zafranzamani12@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email sent from Nodemailer.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
