const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'templates', 'otpTemplate.html');
const rawTemplate = fs.readFileSync(templatePath, 'utf8');

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// const renderTemplate = (otp, name) => {
//   return rawTemplate
//     .replace('{{name}}', name)
//     .replace('{{otp}}', otp)
//     .replace('{{year}}', new Date().getFullYear());
// };

// const sendOTP = async (to, otp, name) => {
//   const mailOptions = {
//     from: `"Dev-Doot" <${process.env.SMTP_USER}>`,
//     to,
//     subject: 'Your OTP Code',
//     html: renderTemplate(otp, name),
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`OTP email sent to ${to}`);
//   } catch (error) {
//     console.error('Error sending OTP email:', error);
//     throw error;
//   }
// };

// Check if SMTP credentials are available
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('WARNING: SMTP_USER or SMTP_PASS environment variables are not set!');
}

// Create transporter with more explicit configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true' ? true : false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Debug options - uncomment if needed for troubleshooting
  // logger: true,
  // debug: true
});

const renderTemplate = (otp, name) => {
  return rawTemplate
    .replace(/{{name}}/g, name)
    .replace(/{{otp}}/g, otp)
    .replace(/{{year}}/g, new Date().getFullYear().toString());
};

const sendOTP = async (to, otp, name) => {
  // Validate required parameters
  if (!to || !otp || !name) {
    throw new Error('Missing required parameters: email, OTP, or name');
  }

  // Validate SMTP credentials before attempting to send
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP credentials missing. Check environment variables SMTP_USER and SMTP_PASS.');
    throw new Error('SMTP configuration error: Missing credentials');
  }

  const mailOptions = {
    from: `"Dev-Doot" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your OTP Code',
    html: renderTemplate(otp, name),
  };

  try {
    // Verify SMTP connection before sending
    await transporter.verify();
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    // More detailed error logging
    if (error.code === 'EAUTH') {
      console.error('SMTP Authentication failed. Check your username and password.');
    } else if (error.code === 'ESOCKET') {
      console.error('SMTP Connection error. Check your host and port settings.');
    }
    
    throw error;
  }
};


module.exports = sendOTP;
