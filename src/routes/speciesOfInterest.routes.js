import express from 'express';
import {
  getSupportedSpecies,
  getSpeciesOfInterest,
  addSpeciesOfInterest,
  updateSpeciesOfInterest,
  deleteSpeciesOfInterest,
  toggleSpeciesOfInterest,
  addSupportedSpecies,
} from '../controllers/speciesOfInterest.controller.js';
import { validateClientCompany } from '../middlewares/clientCompany.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * All routes require CLIENT_USER authentication
 * validateClientCompany middleware checks:
 * - Valid JWT token
 * - User is CLIENT_USER
 * - Company exists and is ACTIVE
 */

/**
 * GET /api/species-of-interest/supported
 * Get all supported species (master list)
 * Accessible by: All CLIENT_USER roles
 */
router.get(
  '/supported',
  validateClientCompany,
  getSupportedSpecies
);

/**
 * GET /api/species-of-interest
 * Get all species of interest for the client's company
 * Accessible by: All CLIENT_USER roles
 */
router.get(
  '/',
  validateClientCompany,
  getSpeciesOfInterest
);

/**
 * POST /api/species-of-interest
 * Add a new species of interest
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
router.post(
  '/',
  validateClientCompany,
  addSpeciesOfInterest
);

/**
 * PUT /api/species-of-interest/:id
 * Update severity level of a species of interest
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
router.put(
  '/:id',
  validateClientCompany,
  updateSpeciesOfInterest
);

/**
 * DELETE /api/species-of-interest/:id
 * Remove (mark inactive) a species of interest
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
router.delete(
  '/:id',
  validateClientCompany,
  deleteSpeciesOfInterest
);

/**
 * PATCH /api/species-of-interest/:id/toggle
 * Toggle active status of a species of interest
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
router.patch(
  '/:id/toggle',
  validateClientCompany,
  toggleSpeciesOfInterest
);

/**
 * POST /api/species-of-interest/supported
 * Add a new species to the master supported species list
 * Accessible by: COMPANY_USER only (any role)
 */
router.post(
  '/supported',
  authMiddleware([]),
  addSupportedSpecies
);

export default router;
