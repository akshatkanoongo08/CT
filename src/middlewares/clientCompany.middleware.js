import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to validate ClientUser requests
 * Checks:
 * 1. User is authenticated
 * 2. User is a CLIENT_USER
 * 3. ClientCompany exists and is ACTIVE
 * 4. Stores company details in req.company for later use
 */
export const validateClientCompany = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Store user info in request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
      role: decoded.role,
    };

    // Only CLIENT_USER needs company validation
    if (decoded.userType !== 'CLIENT_USER') {
      return res.status(403).json({ 
        message: 'Access denied: This endpoint is only for client users' 
      });
    }

    // Fetch the ClientUser to get company details
    const clientUser = await prisma.clientUser.findUnique({
      where: { id: decoded.id },
      include: {
        client: true, // Include ClientCompany details
      },
    });

    if (!clientUser) {
      return res.status(404).json({ message: 'Client user not found' });
    }

    // Check if user's status is ACTIVE
    if (clientUser.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: 'Access denied: Your account is inactive' 
      });
    }

    // Check if the ClientCompany exists
    if (!clientUser.client) {
      return res.status(404).json({ message: 'Client company not found' });
    }

    // Check if ClientCompany is ACTIVE
    if (clientUser.client.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: 'Access denied: Your company is currently inactive. Please contact your administrator.' 
      });
    }

    // Check if company subscription is valid
    if (clientUser.client.validTill && new Date(clientUser.client.validTill) < new Date()) {
      return res.status(403).json({ 
        message: 'Access denied: Your company subscription has expired. Please renew to continue.' 
      });
    }

    // Store company details in request for controller use
    req.company = {
      id: clientUser.client.id,
      companyName: clientUser.client.companyName,
      email: clientUser.client.email,
      mobile: clientUser.client.mobile,
      status: clientUser.client.status,
      clientType: clientUser.client.clientType,
      validTill: clientUser.client.validTill,
      credits: clientUser.client.credits,
      whatsappEnabled: clientUser.client.whatsappEnabled,
      broadcastEnabled: clientUser.client.broadcastEnabled,
      alarmEnabled: clientUser.client.alarmEnabled,
      numProductsAssigned: clientUser.client.numProductsAssigned,
      numProductsInUse: clientUser.client.numProductsInUse,
    };

    // Store full user details
    req.clientUser = {
      id: clientUser.id,
      name: clientUser.name,
      email: clientUser.email,
      mobile: clientUser.mobile,
      role: clientUser.role,
      userType: clientUser.userType,
      clientId: clientUser.clientId,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    console.error('Error in validateClientCompany middleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has required role
 * Use after validateClientCompany or authMiddleware
 * @param {Array} allowedRoles - Array of allowed roles (e.g., ['SUPER_ADMIN', 'ADMIN'])
 */
export const checkRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: 'Access denied: No user information found' });
  }

  if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: `Access denied: Required roles - ${allowedRoles.join(', ')}` 
    });
  }

  next();
};

/**
 * Unified auth middleware for both COMPANY_USER and CLIENT_USER
 * Validates token and loads user details
 * For CLIENT_USER: also validates company status
 */
export const unifiedAuthMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
      role: decoded.role,
    };

    // If COMPANY_USER
    if (decoded.userType === 'COMPANY_USER') {
      const companyUser = await prisma.companyUser.findUnique({
        where: { id: decoded.id },
      });

      if (!companyUser) {
        return res.status(404).json({ message: 'Company user not found' });
      }

      if (companyUser.status !== 'ACTIVE') {
        return res.status(403).json({ message: 'Access denied: Your account is inactive' });
      }

      req.companyUser = companyUser;
    }

    // If CLIENT_USER
    if (decoded.userType === 'CLIENT_USER') {
      const clientUser = await prisma.clientUser.findUnique({
        where: { id: decoded.id },
        include: {
          client: true,
        },
      });

      if (!clientUser) {
        return res.status(404).json({ message: 'Client user not found' });
      }

      if (clientUser.status !== 'ACTIVE') {
        return res.status(403).json({ message: 'Access denied: Your account is inactive' });
      }

      if (!clientUser.client) {
        return res.status(404).json({ message: 'Client company not found' });
      }

      if (clientUser.client.status !== 'ACTIVE') {
        return res.status(403).json({ 
          message: 'Access denied: Your company is currently inactive' 
        });
      }

      if (clientUser.client.validTill && new Date(clientUser.client.validTill) < new Date()) {
        return res.status(403).json({ 
          message: 'Access denied: Your company subscription has expired' 
        });
      }

      req.clientUser = clientUser;
      req.company = clientUser.client;
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    console.error('Error in unifiedAuthMiddleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
