import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authMiddleware = (allowedRoles = []) => async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
      role: decoded.role,
    };

    // Verify user exists
    const user = await prisma.companyUser.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if userType is COMPANY_USER
    if (user.userType !== 'COMPANY_USER') {
      return res.status(403).json({ message: 'Access denied: user must be a COMPANY_USER' });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Access denied: account is inactive' });
    }

    // Check role permissions (if allowedRoles is provided)
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });
  }
};