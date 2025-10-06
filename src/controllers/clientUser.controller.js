import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Login for Client Users
 */
export const loginClientUser = async (req, res) => {
  console.log('loginClientUser called:', req.body);
  
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await prisma.clientUser.findUnique({
      where: { email },
      include: {
        client: true, // Include company details
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact your administrator.' });
    }

    // Check if company exists and is active
    if (!user.client) {
      return res.status(403).json({ message: 'Company not found. Please contact support.' });
    }

    if (user.client.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Your company is currently inactive. Please contact your administrator.' });
    }

    // Check if company subscription is valid
    if (user.client.validTill && new Date(user.client.validTill) < new Date()) {
      return res.status(403).json({ message: 'Your company subscription has expired. Please contact your administrator.' });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
        clientId: user.clientId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        userType: user.userType,
      },
      company: {
        id: user.client.id,
        companyName: user.client.companyName,
        email: user.client.email,
        clientType: user.client.clientType,
        credits: user.client.credits,
      },
    });
  } catch (error) {
    console.error('Error in loginClientUser:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add a new Client User to a company
 * Only CLIENT_USER with SUPER_ADMIN or ADMIN role can add users
 */
export const addClientUser = async (req, res) => {
  console.log('addClientUser called:', req.body);
  
  const { name, email, mobile, role } = req.body;

  if (!name || !email || !mobile) {
    return res.status(400).json({ message: 'Name, email, and mobile are required' });
  }

  // Only SUPER_ADMIN and ADMIN can add users
  if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: Only Super Admin or Admin can add users' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.clientUser.findFirst({
      where: {
        OR: [
          { email },
          { mobile },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or mobile already exists' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create new client user
    const newUser = await prisma.clientUser.create({
      data: {
        clientId: req.company.id, // From validateClientCompany middleware
        name,
        email,
        mobile,
        password: hashedPassword,
        role: role || 'GENERAL',
        userType: 'CLIENT_USER',
        status: 'ACTIVE',
      },
    });

    // TODO: Send email with temporary password

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
      },
      tempPassword, // In production, don't return this - send via email only
    });
  } catch (error) {
    console.error('Error in addClientUser:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all users in the client's company
 */
export const getAllClientUsers = async (req, res) => {
  try {
    const users = await prisma.clientUser.findMany({
      where: {
        clientId: req.company.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error in getAllClientUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update client user details
 */
export const updateClientUser = async (req, res) => {
  const { userId } = req.params;
  const { name, mobile, role, status } = req.body;

  // Only SUPER_ADMIN and ADMIN can update users
  if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: Only Super Admin or Admin can update users' });
  }

  try {
    // Check if user exists and belongs to the same company
    const user = await prisma.clientUser.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.clientId !== req.company.id) {
      return res.status(403).json({ message: 'Access denied: User belongs to a different company' });
    }

    // Prevent changing own role/status
    if (user.id === req.user.id && (role || status)) {
      return res.status(403).json({ message: 'You cannot change your own role or status' });
    }

    // Update user
    const updatedUser = await prisma.clientUser.update({
      where: { id: parseInt(userId) },
      data: {
        ...(name && { name }),
        ...(mobile && { mobile }),
        ...(role && { role }),
        ...(status && { status }),
      },
    });

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('Error in updateClientUser:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a client user
 * Only SUPER_ADMIN can delete users
 */
export const deleteClientUser = async (req, res) => {
  const { userId } = req.params;

  // Only SUPER_ADMIN can delete users
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access denied: Only Super Admin can delete users' });
  }

  try {
    // Check if user exists and belongs to the same company
    const user = await prisma.clientUser.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.clientId !== req.company.id) {
      return res.status(403).json({ message: 'Access denied: User belongs to a different company' });
    }

    // Prevent deleting self
    if (user.id === req.user.id) {
      return res.status(403).json({ message: 'You cannot delete your own account' });
    }

    // Delete user
    await prisma.clientUser.delete({
      where: { id: parseInt(userId) },
    });

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error in deleteClientUser:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Change password for client user
 */
export const changeClientUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  }

  try {
    // Get current user
    const user = await prisma.clientUser.findUnique({
      where: { id: req.user.id },
    });

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.clientUser.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error in changeClientUserPassword:', error);
    res.status(500).json({ message: error.message });
  }
};
