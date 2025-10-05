import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendSetupLinkEmail, sendResetCodeEmail } from '../utils/emailService.js';

const prisma = new PrismaClient();

// Store verification codes temporarily (in production, use a proper cache like Redis)
const verificationCodes = {};

// Generate a unique username based on email or random string
const generateUniqueUsername = async (email, prisma) => {
  // Use email prefix as base (e.g., john@example.com -> john)
  const baseUsername = email.split('@')[0];
  let username = baseUsername;
  let counter = 1;

  // Check if username exists, append number if needed
  while (await prisma.companyUser.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

// addAdminUser
export const addAdminUser = async (req, res) => {
  const { name, mobile, email, role, username: providedUsername } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.companyUser.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if username already exists (if provided)
    if (providedUsername && (await prisma.companyUser.findUnique({ where: { username: providedUsername } }))) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Use provided username or generate a unique one
    const username = providedUsername || (await generateUniqueUsername(email, prisma));

    // Generate random temporary password
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create new user
    const newUser = await prisma.companyUser.create({
      data: {
        name,
        mobile,
        email,
        username,
        password: hashedPassword,
        role: role || 'GENERAL',
        status: 'ACTIVE',
      },
    });

    // Generate setup link
    const setupLink = `${process.env.PANEL_FRONTEND_URL}/admin/setup-password/${email}/${randomPassword}`;
    await sendSetupLinkEmail(email, setupLink);

    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// loginAdminUser
export const loginAdminUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await prisma.companyUser.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if account is inactive
    if (user.status === 'INACTIVE') {
      return res.status(400).json({ message: 'Account is inactive' });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// requestPasswordReset
export const requestPasswordReset = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find user by email
    const user = await prisma.companyUser.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    verificationCodes[email] = {
      code: verificationCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes expiry
      newPassword,
    };

    // Send reset code email
    await sendResetCodeEmail(email, verificationCode);

    res.status(200).json({ message: 'Verification code sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// verifyResetCodeAndUpdatePassword
export const verifyResetCodeAndUpdatePassword = async (req, res) => {
  const { email, code } = req.body;

  try {
    const record = verificationCodes[email];
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Verification code expired or invalid' });
    }

    if (parseInt(code) !== record.code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(record.newPassword, 10);
    await prisma.companyUser.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Remove verification code
    delete verificationCodes[email];

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// setupPassword
export const setupPassword = async (req, res) => {
  const { email, tempPassword, newPassword } = req.body;

  try {
    // Find user by email
    const user = await prisma.companyUser.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify temporary password
    const isTempPasswordCorrect = await bcrypt.compare(tempPassword, user.password);
    if (!isTempPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid temporary password' });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.companyUser.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// editAdminUser
export const editAdminUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, status } = req.body;

  try {
    // Find and update user
    const updatedUser = await prisma.companyUser.update({
      where: { id: parseInt(id) },
      data: { name, email, mobile, status },
    });

    res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

// viewAdminUser
export const viewAdminUser = async (req, res) => {
  try {
    const users = await prisma.companyUser.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
      select: { id: true, name: true, email: true, mobile: true, status: true, role: true },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// getAdminProfile
export const getAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await prisma.companyUser.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, mobile: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// getAllClients
export const getAllClients = async (req, res) => {
  try {
    const clients = await prisma.clientUser.findMany({
      where: { role: 'GENERAL' },
      select: { id: true, name: true, email: true, clientId: true },
      include: { client: { select: { companyName: true } } },
    });

    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
};