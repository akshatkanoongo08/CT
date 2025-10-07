import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add a new CameraTrap
 * Only accessible by Company ADMIN or SUPER_ADMIN
 */
export const addCameraTrap = async (req, res) => {
  console.log('addCameraTrap called:', req.body);

  const {
    batchId,
    productId,
    assignedToId, // ClientCompany ID
    productType,
    validTill,
    gps,
    imei,
    sim,
    simNumber,
    location,
  } = req.body;

  // Validate required fields (adjust based on your business logic)
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    // If assignedToId is provided, verify the ClientCompany exists
    if (assignedToId) {
      const clientCompany = await prisma.clientCompany.findUnique({
        where: { id: assignedToId },
      });

      if (!clientCompany) {
        return res.status(404).json({ message: 'Client company not found' });
      }

      if (clientCompany.status !== 'ACTIVE') {
        return res.status(400).json({ message: 'Cannot assign to inactive company' });
      }
    }

    // Create CameraTrap
    const cameraTrap = await prisma.cameraTrap.create({
      data: {
        batchId,
        productId,
        assignedToId: assignedToId || null,
        assignedAt: assignedToId ? new Date() : null,
        assignedById: assignedToId ? req.user.id : null, // Company user who assigned
        productType,
        validTill: validTill ? new Date(validTill) : null,
        gps,
        imei,
        sim,
        simNumber,
        location,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update ClientCompany product count if assigned
    if (assignedToId) {
      await prisma.clientCompany.update({
        where: { id: assignedToId },
        data: {
          numProductsAssigned: {
            increment: 1,
          },
        },
      });
    }

    res.status(201).json({
      message: 'CameraTrap added successfully',
      cameraTrap,
    });
  } catch (error) {
    console.error('Error adding CameraTrap:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all CameraTraps
 * Company users: see all
 * Client users: see only assigned to their company
 */
export const getAllCameraTraps = async (req, res) => {
  console.log('getAllCameraTraps called by:', req.user);

  try {
    let whereClause = {};

    // If CLIENT_USER, filter by their company
    if (req.user.userType === 'CLIENT_USER') {
      // Get user's company ID
      const clientUser = await prisma.clientUser.findUnique({
        where: { id: req.user.id },
      });

      if (!clientUser) {
        return res.status(404).json({ message: 'Client user not found' });
      }

      whereClause = {
        assignedToId: clientUser.clientId,
      };
    }

    const cameraTraps = await prisma.cameraTrap.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            companyName: true,
            email: true,
            status: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'CameraTraps retrieved successfully',
      count: cameraTraps.length,
      cameraTraps,
    });
  } catch (error) {
    console.error('Error fetching CameraTraps:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get single CameraTrap by ID
 */
export const getCameraTrap = async (req, res) => {
  const { trapId } = req.params;

  try {
    const cameraTrap = await prisma.cameraTrap.findUnique({
      where: { id: trapId },
      include: {
        assignedTo: {
          select: {
            id: true,
            companyName: true,
            email: true,
            mobile: true,
            status: true,
            clientType: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!cameraTrap) {
      return res.status(404).json({ message: 'CameraTrap not found' });
    }

    // If CLIENT_USER, verify it's assigned to their company
    if (req.user.userType === 'CLIENT_USER') {
      const clientUser = await prisma.clientUser.findUnique({
        where: { id: req.user.id },
      });

      if (cameraTrap.assignedToId !== clientUser.clientId) {
        return res.status(403).json({ message: 'Access denied: CameraTrap not assigned to your company' });
      }
    }

    res.status(200).json({
      message: 'CameraTrap retrieved successfully',
      cameraTrap,
    });
  } catch (error) {
    console.error('Error fetching CameraTrap:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Edit CameraTrap
 * Accessible by both Company users and Client users (with restrictions)
 */
export const editCameraTrap = async (req, res) => {
  console.log('editCameraTrap called:', req.params, req.body);

  const { trapId } = req.params;
  const {
    batchId,
    productId,
    assignedToId,
    productType,
    validTill,
    gps,
    imei,
    sim,
    simNumber,
    location,
  } = req.body;

  try {
    // Check if CameraTrap exists
    const existingTrap = await prisma.cameraTrap.findUnique({
      where: { id: trapId },
    });

    if (!existingTrap) {
      return res.status(404).json({ message: 'CameraTrap not found' });
    }

    // If CLIENT_USER, verify it's assigned to their company
    if (req.user.userType === 'CLIENT_USER') {
      const clientUser = await prisma.clientUser.findUnique({
        where: { id: req.user.id },
      });

      if (existingTrap.assignedToId !== clientUser.clientId) {
        return res.status(403).json({ message: 'Access denied: CameraTrap not assigned to your company' });
      }

      // Client users cannot change assignment
      if (assignedToId && assignedToId !== existingTrap.assignedToId) {
        return res.status(403).json({ message: 'Access denied: Client users cannot change assignment' });
      }
    }

    // If changing assignment, verify new company exists
    if (assignedToId && assignedToId !== existingTrap.assignedToId) {
      const newCompany = await prisma.clientCompany.findUnique({
        where: { id: assignedToId },
      });

      if (!newCompany) {
        return res.status(404).json({ message: 'New client company not found' });
      }

      if (newCompany.status !== 'ACTIVE') {
        return res.status(400).json({ message: 'Cannot assign to inactive company' });
      }
    }

    // Prepare update data
    const updateData = {
      ...(batchId !== undefined && { batchId }),
      ...(productId !== undefined && { productId }),
      ...(productType !== undefined && { productType }),
      ...(validTill !== undefined && { validTill: validTill ? new Date(validTill) : null }),
      ...(gps !== undefined && { gps }),
      ...(imei !== undefined && { imei }),
      ...(sim !== undefined && { sim }),
      ...(simNumber !== undefined && { simNumber }),
      ...(location !== undefined && { location }),
    };

    // Handle assignment changes (only for company users)
    if (req.user.userType === 'COMPANY_USER' && assignedToId !== undefined) {
      const oldAssignedToId = existingTrap.assignedToId;
      const newAssignedToId = assignedToId;

      // If assignment changed
      if (oldAssignedToId !== newAssignedToId) {
        // Decrement old company's count
        if (oldAssignedToId) {
          await prisma.clientCompany.update({
            where: { id: oldAssignedToId },
            data: {
              numProductsAssigned: {
                decrement: 1,
              },
            },
          });
        }

        // Increment new company's count
        if (newAssignedToId) {
          await prisma.clientCompany.update({
            where: { id: newAssignedToId },
            data: {
              numProductsAssigned: {
                increment: 1,
              },
            },
          });
        }

        updateData.assignedToId = newAssignedToId;
        updateData.assignedAt = newAssignedToId ? new Date() : null;
        updateData.assignedById = newAssignedToId ? req.user.id : null;
      }
    }

    // Update CameraTrap
    const updatedTrap = await prisma.cameraTrap.update({
      where: { id: trapId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'CameraTrap updated successfully',
      cameraTrap: updatedTrap,
    });
  } catch (error) {
    console.error('Error editing CameraTrap:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete CameraTrap
 * Only accessible by Company users (ADMIN or SUPER_ADMIN)
 */
export const deleteCameraTrap = async (req, res) => {
  console.log('deleteCameraTrap called:', req.params);

  const { trapId } = req.params;

  try {
    // Only COMPANY_USER can delete
    if (req.user.userType !== 'COMPANY_USER') {
      return res.status(403).json({
        message: 'Access denied: Only company users can delete CameraTraps',
      });
    }

    // Check if CameraTrap exists
    const cameraTrap = await prisma.cameraTrap.findUnique({
      where: { id: trapId },
    });

    if (!cameraTrap) {
      return res.status(404).json({ message: 'CameraTrap not found' });
    }

    // Decrement company's product count if assigned
    if (cameraTrap.assignedToId) {
      await prisma.clientCompany.update({
        where: { id: cameraTrap.assignedToId },
        data: {
          numProductsAssigned: {
            decrement: 1,
          },
        },
      });
    }

    // Delete the CameraTrap
    await prisma.cameraTrap.delete({
      where: { id: trapId },
    });

    res.status(200).json({
      message: 'CameraTrap deleted successfully',
      deletedTrap: {
        id: cameraTrap.id,
        productId: cameraTrap.productId,
        assignedTo: cameraTrap.assignedToId,
      },
    });
  } catch (error) {
    console.error('Error deleting CameraTrap:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Assign CameraTrap to a ClientCompany
 * Only accessible by Company ADMIN or SUPER_ADMIN
 */
export const assignCameraTrap = async (req, res) => {
  console.log('assignCameraTrap called:', req.params, req.body);

  const { trapId } = req.params;
  const { assignedToId } = req.body;

  if (!assignedToId) {
    return res.status(400).json({ message: 'assignedToId is required' });
  }

  try {
    // Check if CameraTrap exists
    const cameraTrap = await prisma.cameraTrap.findUnique({
      where: { id: trapId },
    });

    if (!cameraTrap) {
      return res.status(404).json({ message: 'CameraTrap not found' });
    }

    // Check if ClientCompany exists
    const clientCompany = await prisma.clientCompany.findUnique({
      where: { id: assignedToId },
    });

    if (!clientCompany) {
      return res.status(404).json({ message: 'Client company not found' });
    }

    if (clientCompany.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Cannot assign to inactive company' });
    }

    // If already assigned to another company, decrement old company's count
    if (cameraTrap.assignedToId && cameraTrap.assignedToId !== assignedToId) {
      await prisma.clientCompany.update({
        where: { id: cameraTrap.assignedToId },
        data: {
          numProductsAssigned: {
            decrement: 1,
          },
        },
      });
    }

    // Update CameraTrap assignment
    const updatedTrap = await prisma.cameraTrap.update({
      where: { id: trapId },
      data: {
        assignedToId,
        assignedAt: new Date(),
        assignedById: req.user.id,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Increment new company's product count
    await prisma.clientCompany.update({
      where: { id: assignedToId },
      data: {
        numProductsAssigned: {
          increment: 1,
        },
      },
    });

    res.status(200).json({
      message: 'CameraTrap assigned successfully',
      cameraTrap: updatedTrap,
    });
  } catch (error) {
    console.error('Error assigning CameraTrap:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Unassign CameraTrap from a ClientCompany
 * Only accessible by Company ADMIN or SUPER_ADMIN
 */
export const unassignCameraTrap = async (req, res) => {
  console.log('unassignCameraTrap called:', req.params);

  const { trapId } = req.params;

  try {
    // Check if CameraTrap exists
    const cameraTrap = await prisma.cameraTrap.findUnique({
      where: { id: trapId },
    });

    if (!cameraTrap) {
      return res.status(404).json({ message: 'CameraTrap not found' });
    }

    if (!cameraTrap.assignedToId) {
      return res.status(400).json({ message: 'CameraTrap is not assigned to any company' });
    }

    // Decrement company's product count
    await prisma.clientCompany.update({
      where: { id: cameraTrap.assignedToId },
      data: {
        numProductsAssigned: {
          decrement: 1,
        },
      },
    });

    // Unassign CameraTrap
    const updatedTrap = await prisma.cameraTrap.update({
      where: { id: trapId },
      data: {
        assignedToId: null,
        assignedAt: null,
        assignedById: null,
      },
    });

    res.status(200).json({
      message: 'CameraTrap unassigned successfully',
      cameraTrap: updatedTrap,
    });
  } catch (error) {
    console.error('Error unassigning CameraTrap:', error);
    res.status(500).json({ message: error.message });
  }
};
