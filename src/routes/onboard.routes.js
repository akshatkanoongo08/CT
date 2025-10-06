import express from 'express';
import {
  onboardClientCompany,
  editClientCompany,
  toggleClientCompanyStatus,
  deleteClientCompany,
  getAllClientCompanies,
  getClientCompany,
} from '../controllers/onboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { unifiedAuthMiddleware, checkRole } from '../middlewares/clientCompany.middleware.js';

const router = express.Router();

// ==========================================
// Routes accessible by COMPANY_USER only
// ==========================================

/**
 * POST /api/onboard/client-company
 * Onboard a new client company
 * Accessible by: Company SUPER_ADMIN and ADMIN
 */
router.post(
  '/client-company',
  authMiddleware(['SUPER_ADMIN', 'ADMIN']),
  onboardClientCompany
);

/**
 * GET /api/onboard/client-companies
 * Get all client companies
 * Accessible by: Company users (SUPER_ADMIN, ADMIN, GENERAL)
 */
router.get(
  '/client-companies',
  authMiddleware(),
  getAllClientCompanies
);

/**
 * DELETE /api/onboard/client-company/:companyId
 * Delete a client company
 * Accessible by: Company SUPER_ADMIN only
 */
router.delete(
  '/client-company/:companyId',
  authMiddleware(['SUPER_ADMIN']),
  deleteClientCompany
);

// ==========================================
// Routes accessible by both COMPANY_USER and CLIENT_USER
// ==========================================

/**
 * GET /api/onboard/client-company/:companyId
 * Get single client company details
 * Accessible by: Company users and Client users
 */
router.get(
  '/client-company/:companyId',
  unifiedAuthMiddleware,
  getClientCompany
);

/**
 * PUT /api/onboard/client-company/:companyId
 * Edit client company information
 * Accessible by: Company ADMIN/SUPER_ADMIN and Client SUPER_ADMIN/ADMIN
 */
router.put(
  '/client-company/:companyId',
  unifiedAuthMiddleware,
  checkRole(['SUPER_ADMIN', 'ADMIN']),
  editClientCompany
);

/**
 * PATCH /api/onboard/client-company/:companyId/status
 * Toggle client company status (ACTIVE/INACTIVE)
 * Accessible by: Company ADMIN/SUPER_ADMIN and Client SUPER_ADMIN/ADMIN
 */
router.patch(
  '/client-company/:companyId/status',
  unifiedAuthMiddleware,
  checkRole(['SUPER_ADMIN', 'ADMIN']),
  toggleClientCompanyStatus
);

export default router;
