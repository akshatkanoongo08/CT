import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all supported species (master list)
 * Returns only active species
 */
export const getSupportedSpecies = async (req, res) => {
  try {
    const species = await prisma.supportedSpecies.findMany({
      where: { active: true },
      orderBy: { specieName: 'asc' },
    });

    res.status(200).json({
      message: 'Supported species retrieved successfully',
      species,
    });
  } catch (error) {
    console.error('Error in getSupportedSpecies:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all species of interest for the client's company
 * Accessible by: CLIENT_USER (all roles)
 */
export const getSpeciesOfInterest = async (req, res) => {
  try {
    const clientId = req.company.id; // From middleware

    const speciesOfInterest = await prisma.speciesOfInterest.findMany({
      where: { 
        clientId,
        active: true,
      },
      include: {
        supportedSpecies: {
          select: {
            specieId: true,
            specieName: true,
            active: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: 'Species of interest retrieved successfully',
      speciesOfInterest,
      count: speciesOfInterest.length,
    });
  } catch (error) {
    console.error('Error in getSpeciesOfInterest:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add a species of interest
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
export const addSpeciesOfInterest = async (req, res) => {
  const { specieId, severityLevel } = req.body;

  if (!specieId || !severityLevel) {
    return res.status(400).json({ 
      message: 'Species ID and severity level are required' 
    });
  }

  // Validate severity level
  const validSeverityLevels = ['LOW', 'MEDIUM', 'HIGH'];
  if (!validSeverityLevels.includes(severityLevel)) {
    return res.status(400).json({ 
      message: 'Invalid severity level. Must be LOW, MEDIUM, or HIGH' 
    });
  }

  try {
    const clientId = req.company.id;

    // Check if supported species exists and is active
    const supportedSpecies = await prisma.supportedSpecies.findUnique({
      where: { specieId },
    });

    if (!supportedSpecies) {
      return res.status(404).json({ message: 'Species not found in supported list' });
    }

    if (!supportedSpecies.active) {
      return res.status(400).json({ message: 'This species is no longer supported' });
    }

    // Check if already added by this client
    const existing = await prisma.speciesOfInterest.findUnique({
      where: {
        clientId_specieId: {
          clientId,
          specieId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Species already added to your interest list' });
    }

    // Create species of interest
    const speciesOfInterest = await prisma.speciesOfInterest.create({
      data: {
        clientId,
        specieId,
        specieName: supportedSpecies.specieName,
        severityLevel,
      },
      include: {
        supportedSpecies: {
          select: {
            specieId: true,
            specieName: true,
            active: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Species of interest added successfully',
      speciesOfInterest,
    });
  } catch (error) {
    console.error('Error in addSpeciesOfInterest:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update a species of interest (severity level)
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
export const updateSpeciesOfInterest = async (req, res) => {
  const { id } = req.params;
  const { severityLevel } = req.body;

  if (!severityLevel) {
    return res.status(400).json({ message: 'Severity level is required' });
  }

  // Validate severity level
  const validSeverityLevels = ['LOW', 'MEDIUM', 'HIGH'];
  if (!validSeverityLevels.includes(severityLevel)) {
    return res.status(400).json({ 
      message: 'Invalid severity level. Must be LOW, MEDIUM, or HIGH' 
    });
  }

  try {
    const clientId = req.company.id;

    // Check if species of interest exists and belongs to this client
    const speciesOfInterest = await prisma.speciesOfInterest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!speciesOfInterest) {
      return res.status(404).json({ message: 'Species of interest not found' });
    }

    if (speciesOfInterest.clientId !== clientId) {
      return res.status(403).json({ message: 'Access denied: This species belongs to a different company' });
    }

    // Update severity level
    const updated = await prisma.speciesOfInterest.update({
      where: { id: parseInt(id) },
      data: { severityLevel },
      include: {
        supportedSpecies: {
          select: {
            specieId: true,
            specieName: true,
            active: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Species of interest updated successfully',
      speciesOfInterest: updated,
    });
  } catch (error) {
    console.error('Error in updateSpeciesOfInterest:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete (mark inactive) a species of interest
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
export const deleteSpeciesOfInterest = async (req, res) => {
  const { id } = req.params;

  try {
    const clientId = req.company.id;

    // Check if species of interest exists and belongs to this client
    const speciesOfInterest = await prisma.speciesOfInterest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!speciesOfInterest) {
      return res.status(404).json({ message: 'Species of interest not found' });
    }

    if (speciesOfInterest.clientId !== clientId) {
      return res.status(403).json({ message: 'Access denied: This species belongs to a different company' });
    }

    // Mark as inactive instead of deleting
    await prisma.speciesOfInterest.update({
      where: { id: parseInt(id) },
      data: { active: false },
    });

    res.status(200).json({
      message: 'Species of interest removed successfully',
      deletedSpecies: {
        id: speciesOfInterest.id,
        specieName: speciesOfInterest.specieName,
      },
    });
  } catch (error) {
    console.error('Error in deleteSpeciesOfInterest:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Toggle active status of a species of interest
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
export const toggleSpeciesOfInterest = async (req, res) => {
  const { id } = req.params;

  try {
    const clientId = req.company.id;

    // Check if species of interest exists and belongs to this client
    const speciesOfInterest = await prisma.speciesOfInterest.findUnique({
      where: { id: parseInt(id) },
    });

    if (!speciesOfInterest) {
      return res.status(404).json({ message: 'Species of interest not found' });
    }

    if (speciesOfInterest.clientId !== clientId) {
      return res.status(403).json({ message: 'Access denied: This species belongs to a different company' });
    }

    // Toggle active status
    const updated = await prisma.speciesOfInterest.update({
      where: { id: parseInt(id) },
      data: { active: !speciesOfInterest.active },
      include: {
        supportedSpecies: {
          select: {
            specieId: true,
            specieName: true,
            active: true,
          },
        },
      },
    });

    res.status(200).json({
      message: `Species of interest ${updated.active ? 'activated' : 'deactivated'} successfully`,
      speciesOfInterest: updated,
    });
  } catch (error) {
    console.error('Error in toggleSpeciesOfInterest:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add new species to the master supported species list (Company Admin only)
export const addSupportedSpecies = async (req, res) => {
  try {
    const { specieId, specieName } = req.body;

    // Validation
    if (!specieId || !specieName) {
      return res.status(400).json({ 
        message: 'specieId and specieName are required' 
      });
    }

    // Check if species with same specieId already exists
    const existingSpecies = await prisma.supportedSpecies.findUnique({
      where: { specieId },
    });

    if (existingSpecies) {
      return res.status(400).json({ 
        message: `Species with specieId '${specieId}' already exists in the master list` 
      });
    }

    // Create new supported species
    const newSpecies = await prisma.supportedSpecies.create({
      data: {
        specieId,
        specieName,
        active: true,
      },
    });

    res.status(201).json({
      message: 'Species added to master list successfully',
      species: newSpecies,
    });
  } catch (error) {
    console.error('Error in addSupportedSpecies:', error);
    res.status(500).json({ message: error.message });
  }
};
