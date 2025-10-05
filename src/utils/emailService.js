import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

// Send email for password setup with a setup link
export const sendSetupLinkEmail = async (to, setupLink) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Set Up Your Password',
    text: `Welcome! Please set up your password using the following link: ${setupLink}`,
    html: `<p>Welcome! Please set up your password using the following link: <a href="${setupLink}">${setupLink}</a></p>`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error while sending setup email:', error);
        reject(error);
      } else {
        console.log('Setup email sent successfully:', info.response);
        resolve(info);
      }
    });
  });
};

// Send email for password reset with a verification code
export const sendResetCodeEmail = async (to, verificationCode) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Password Reset Verification Code',
    text: `Your verification code for password reset is: ${verificationCode}`,
    html: `<p>Your verification code for password reset is: <strong>${verificationCode}</strong></p>`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error while sending reset code email:', error);
        reject(error);
      } else {
        console.log('Reset code email sent successfully:', info.response);
        resolve(info);
      }
    });
  });
};