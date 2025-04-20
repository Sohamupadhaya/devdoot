const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const otpEmailTemplate = (otp, name) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hello, ${name}</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 4px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} Dev-Doot. All rights reserved.</p>
      </div>
    </div>
  `;
};

const sendOTP = async (to, otp, name) => {
  const mailOptions = {
    from: `"Dev-Doot" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your OTP Code',
    html: otpEmailTemplate(otp, name),
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
