import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendClientSuperAdminSetupEmail } from '../utils/emailService.js';

const prisma = new PrismaClient();

// Generate a unique username for client user
const generateUniqueClientUsername = async (email) => {
  const baseUsername = email.split('@')[0];
  let username = baseUsername;
  let counter = 1;

  while (await prisma.clientUser.findFirst({ where: { email: username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

/**
 * Onboard a new Client Company
 * Only accessible by Company Users with SUPER_ADMIN or ADMIN role
 * Creates ClientCompany and ClientUser (super admin) in a transaction
 * Sends setup email to client super admin
 */
export const onboardClientCompany = async (req, res) => {
  console.log('onboardClientCompany called:', req.body);
  
  const {
    // ClientCompany details
    companyName,
    companyEmail,
    companyMobile,
    clientType,
    validTill,
    credits,
    whatsappEnabled,
    broadcastEnabled,
    alarmEnabled,
    
    // Client Super Admin details
    adminName,
    adminEmail,
    adminMobile,
  } = req.body;

  // Validate required fields
  if (!companyName || !companyEmail || !companyMobile) {
    return res.status(400).json({ message: 'Company name, email, and mobile are required' });
  }

  if (!adminName || !adminEmail || !adminMobile) {
    return res.status(400).json({ message: 'Admin name, email, and mobile are required' });
  }

  try {
    // Check if company already exists
    const existingCompany = await prisma.clientCompany.findFirst({
      where: {
        OR: [
          { email: companyEmail },
          { mobile: companyMobile }
        ]
      }
    });

    if (existingCompany) {
      return res.status(400).json({ message: 'Company with this email or mobile already exists' });
    }

    // Check if client admin email or mobile already exists
    const existingClientUser = await prisma.clientUser.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { mobile: adminMobile }
        ]
      }
    });

    if (existingClientUser) {
      return res.status(400).json({ message: 'Client user with this email or mobile already exists' });
    }

    // Generate temporary password for client super admin
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create ClientCompany and ClientUser in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ClientCompany
      const clientCompany = await tx.clientCompany.create({
        data: {
          companyName,
          email: companyEmail,
          mobile: companyMobile,
          clientType: clientType || 'STANDARD',
          validTill: validTill ? new Date(validTill) : null,
          credits: credits || 0,
          whatsappEnabled: whatsappEnabled || false,
          broadcastEnabled: broadcastEnabled || false,
          alarmEnabled: alarmEnabled || false,
          status: 'ACTIVE',
          createdById: req.user.id, // From auth middleware
          numProductsAssigned: 0,
          numProductsInUse: 0,
        },
      });

      // Create ClientUser (Super Admin)
      const clientSuperAdmin = await tx.clientUser.create({
        data: {
          clientId: clientCompany.id,
          name: adminName,
          email: adminEmail,
          mobile: adminMobile,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          userType: 'CLIENT_USER',
          status: 'ACTIVE',
        },
      });

      return { clientCompany, clientSuperAdmin };
    });

    // Send setup email to client super admin
    try {
      await sendClientSuperAdminSetupEmail(
        adminEmail,
        adminName,
        companyName,
        tempPassword
      );
    } catch (emailError) {
      console.error('Failed to send setup email:', emailError);
      // Don't fail the whole operation if email fails
    }

    res.status(201).json({
      message: 'Client company onboarded successfully. Setup email sent to admin.',
      company: {
        id: result.clientCompany.id,
        companyName: result.clientCompany.companyName,
        email: result.clientCompany.email,
        mobile: result.clientCompany.mobile,
        clientType: result.clientCompany.clientType,
        status: result.clientCompany.status,
      },
      admin: {
        id: result.clientSuperAdmin.id,
        name: result.clientSuperAdmin.name,
        email: result.clientSuperAdmin.email,
        role: result.clientSuperAdmin.role,
      },
    });
  } catch (error) {
    console.error('Error onboarding client company:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Edit Client Company Information
 * Accessible by Company ADMIN/SUPER_ADMIN and Client SUPER_ADMIN/ADMIN
 */
export const editClientCompany = async (req, res) => {
  console.log('editClientCompany called:', req.params, req.body);
  
  const { companyId } = req.params;
  const {
    companyName,
    email,
    mobile,
    clientType,
    validTill,
    credits,
    whatsappEnabled,
    broadcastEnabled,
    alarmEnabled,
  } = req.body;

  try {
    // Check if company exists
    const company = await prisma.clientCompany.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Authorization check
    const userType = req.user.userType;
    const userRole = req.user.role;

    // If CLIENT_USER, verify they belong to this company
    if (userType === 'CLIENT_USER') {
      const clientUser = await prisma.clientUser.findUnique({
        where: { id: req.user.id },
      });

      if (clientUser.clientId !== companyId) {
        return res.status(403).json({ message: 'Access denied: You can only edit your own company' });
      }

      // Only SUPER_ADMIN and ADMIN of client can edit
      if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      }
    }

    // Check for duplicate email or mobile (excluding current company)
    if (email || mobile) {
      const duplicate = await prisma.clientCompany.findFirst({
        where: {
          AND: [
            { id: { not: companyId } },
            {
              OR: [
                email ? { email } : {},
                mobile ? { mobile } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (duplicate) {
        return res.status(400).json({ message: 'Company with this email or mobile already exists' });
      }
    }

    // Update company
    const updatedCompany = await prisma.clientCompany.update({
      where: { id: companyId },
      data: {
        ...(companyName && { companyName }),
        ...(email && { email }),
        ...(mobile && { mobile }),
        ...(clientType && { clientType }),
        ...(validTill && { validTill: new Date(validTill) }),
        ...(credits !== undefined && { credits }),
        ...(whatsappEnabled !== undefined && { whatsappEnabled }),
        ...(broadcastEnabled !== undefined && { broadcastEnabled }),
        ...(alarmEnabled !== undefined && { alarmEnabled }),
        // Only set modifiedById if user is COMPANY_USER (foreign key constraint)
        ...(userType === 'COMPANY_USER' && { modifiedById: req.user.id }),
      },
    });

    res.status(200).json({
      message: 'Company updated successfully',
      company: updatedCompany,
    });
  } catch (error) {
    console.error('Error editing client company:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Toggle Client Company Status (ACTIVE/INACTIVE)
 * Accessible by Company ADMIN/SUPER_ADMIN and Client SUPER_ADMIN/ADMIN
 */
export const toggleClientCompanyStatus = async (req, res) => {
  console.log('toggleClientCompanyStatus called:', req.params, req.body);
  
  const { companyId } = req.params;
  const { status } = req.body;

  if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ message: 'Valid status (ACTIVE/INACTIVE) is required' });
  }

  try {
    // Check if company exists
    const company = await prisma.clientCompany.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Authorization check
    const userType = req.user.userType;
    const userRole = req.user.role;

    // If CLIENT_USER, verify they belong to this company
    if (userType === 'CLIENT_USER') {
      const clientUser = await prisma.clientUser.findUnique({
        where: { id: req.user.id },
      });

      if (clientUser.clientId !== companyId) {
        return res.status(403).json({ message: 'Access denied: You can only manage your own company' });
      }

      // Only SUPER_ADMIN and ADMIN of client can toggle status
      if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      }
    }

    // Update status
    const updatedCompany = await prisma.clientCompany.update({
      where: { id: companyId },
      data: {
        status,
        modifiedById: req.user.id,
      },
    });

    res.status(200).json({
      message: `Company status updated to ${status}`,
      company: {
        id: updatedCompany.id,
        companyName: updatedCompany.companyName,
        status: updatedCompany.status,
      },
    });
  } catch (error) {
    console.error('Error toggling company status:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Client Company
 * Only accessible by Company SUPER_ADMIN
 */
export const deleteClientCompany = async (req, res) => {
  console.log('deleteClientCompany called:', req.params);
  
  const { companyId } = req.params;

  try {
    // Only Company SUPER_ADMIN can delete
    if (req.user.userType !== 'COMPANY_USER' || req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        message: 'Access denied: Only Company Super Admin can delete companies' 
      });
    }

    // Check if company exists
    const company = await prisma.clientCompany.findUnique({
      where: { id: companyId },
      include: {
        clientUsers: true,
        products: true,
      },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Delete in transaction (cascade delete client users and unassign products)
    await prisma.$transaction(async (tx) => {
      // Delete all client users
      await tx.clientUser.deleteMany({
        where: { clientId: companyId },
      });

      // Unassign all products
      await tx.product.updateMany({
        where: { assignedToId: companyId },
        data: {
          assignedToId: null,
          assignedAt: null,
        },
      });

      // Delete the company
      await tx.clientCompany.delete({
        where: { id: companyId },
      });
    });

    res.status(200).json({
      message: 'Company deleted successfully',
      deletedCompany: {
        id: company.id,
        companyName: company.companyName,
        deletedUsers: company.clientUsers.length,
        unassignedProducts: company.products.length,
      },
    });
  } catch (error) {
    console.error('Error deleting client company:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all client companies
 * Accessible by Company users
 */
export const getAllClientCompanies = async (req, res) => {
  try {
    const companies = await prisma.clientCompany.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            clientUsers: true,
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'Client companies retrieved successfully',
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error('Error fetching client companies:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single client company details
 */
export const getClientCompany = async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await prisma.clientCompany.findUnique({
      where: { id: companyId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        modifiedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        clientUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            role: true,
            status: true,
          },
        },
        products: {
          select: {
            id: true,
            productId: true,
            productType: true,
            assignedAt: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({
      message: 'Company details retrieved successfully',
      company,
    });
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ message: error.message });
  }
};
