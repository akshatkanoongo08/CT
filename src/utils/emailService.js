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

// Send email to Client Company Super Admin with temporary password
export const sendClientSuperAdminSetupEmail = async (to, adminName, companyName, tempPassword) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: `Welcome to ${companyName} - Your Account Setup`,
    text: `Hello ${adminName},

Welcome to ${companyName}! Your company has been successfully onboarded to our platform.

You have been designated as the Super Admin for your company. Here are your login credentials:

Email: ${to}
Temporary Password: ${tempPassword}

IMPORTANT: Please login and change your password immediately for security reasons.

As a Super Admin, you can:
- Add and manage users for your company
- View and manage company settings
- Assign products and manage company resources

If you have any questions or need assistance, please contact our support team.

Best regards,
The Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to ${companyName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">Hello <strong>${adminName}</strong>,</p>
          
          <p style="color: #666; line-height: 1.6;">
            Your company has been successfully onboarded to our platform. You have been designated as the 
            <strong>Super Admin</strong> for your company.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Login Credentials:</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${tempPassword}</code></p>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠ IMPORTANT:</strong> Please login and change your password immediately for security reasons.
            </p>
          </div>
          
          <h3 style="color: #333; margin-top: 30px;">As a Super Admin, you can:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Add and manage users for your company</li>
            <li>View and manage company settings</li>
            <li>Assign products and manage company resources</li>
            <li>Monitor company activities and reports</li>
          </ul>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Best regards,<br>
              The Team
            </p>
          </div>
        </div>
      </div>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error while sending client super admin setup email:', error);
        reject(error);
      } else {
        console.log('Client super admin setup email sent successfully:', info.response);
        resolve(info);
      }
    });
  });
};

// Send email to new Client User with temporary password
export const sendClientUserSetupEmail = async (to, userName, companyName, tempPassword, role) => {
  const transporter = createTransporter();

  const rolePermissions = {
    SUPER_ADMIN: ['Manage all users', 'Edit company information', 'View all camera traps', 'Edit camera trap details'],
    ADMIN: ['Manage users', 'Edit company information', 'View all camera traps', 'Edit camera trap details'],
    GENERAL: ['View assigned camera traps', 'Edit camera trap operational details (IMEI, SIM)']
  };

  const permissions = rolePermissions[role] || rolePermissions.GENERAL;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: `Welcome to ${companyName} - Your Account Has Been Created`,
    text: `Hello ${userName},

Welcome to ${companyName}! Your account has been created by your company administrator.

Here are your login credentials:

Email: ${to}
Temporary Password: ${tempPassword}
Role: ${role}

IMPORTANT: Please login and change your password immediately for security reasons.

Login URL: ${process.env.CLIENT_APP_URL || 'http://localhost:3001'}

If you have any questions, please contact your company administrator.

Best regards,
The Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to ${companyName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
          
          <p style="color: #666; line-height: 1.6;">
            Your account has been created by your company administrator. You can now access the camera trap management system.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Login Credentials:</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${tempPassword}</code></p>
            <p style="margin: 10px 0;"><strong>Your Role:</strong> <span style="background-color: #007bff; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px;">${role}</span></p>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠ IMPORTANT:</strong> Please login and change your password immediately for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_APP_URL || 'http://localhost:3001'}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Login Now</a>
          </div>
          
          <h3 style="color: #333; margin-top: 30px;">Your Permissions:</h3>
          <ul style="color: #666; line-height: 1.8;">
            ${permissions.map(perm => `<li>${perm}</li>`).join('')}
          </ul>
          
          <p style="color: #666; line-height: 1.6; margin-top: 30px;">
            If you have any questions or need assistance, please contact your company administrator.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Best regards,<br>
              The CTSELF Team
            </p>
          </div>
        </div>
      </div>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error while sending client user setup email:', error);
        reject(error);
      } else {
        console.log('Client user setup email sent successfully:', info.response);
        resolve(info);
      }
    });
  });
};
