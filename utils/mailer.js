const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'templates', 'otpTemplate.html');
const rawTemplate = fs.readFileSync(templatePath, 'utf8');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const renderTemplate = (otp, name) => {
  return rawTemplate
    .replace('{{name}}', name)
    .replace('{{otp}}', otp)
    .replace('{{year}}', new Date().getFullYear());
};

const sendOTP = async (to, otp, name) => {
  const mailOptions = {
    from: `"Dev-Doot" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your OTP Code',
    html: renderTemplate(otp, name),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

module.exports = sendOTP;
