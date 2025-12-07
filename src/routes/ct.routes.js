import express from 'express';
import {
  addCameraTrap,
  getAllCameraTraps,
  getCameraTrap,
  editCameraTrap,
  deleteCameraTrap,
  assignCameraTrap,
  unassignCameraTrap,
  toggleCameraTrapStatus,
} from '../controllers/ct.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { unifiedAuthMiddleware } from '../middlewares/clientCompany.middleware.js';

const router = express.Router();

// ==========================================
// Routes accessible by COMPANY_USER only
// ==========================================

/**
 * POST /api/camera-traps
 * Add a new CameraTrap
 * Accessible by: Company ADMIN and SUPER_ADMIN
 */
router.post(
  '/',
  authMiddleware(['ADMIN', 'SUPER_ADMIN']),
  addCameraTrap
);

/**
 * DELETE /api/camera-traps/:trapId
 * Delete a CameraTrap
 * Accessible by: Company ADMIN and SUPER_ADMIN only
 */
router.delete(
  '/:trapId',
  authMiddleware(['ADMIN', 'SUPER_ADMIN']),
  deleteCameraTrap
);

/**
 * POST /api/camera-traps/:trapId/assign
 * Assign CameraTrap to a ClientCompany
 * Accessible by: Company ADMIN and SUPER_ADMIN
 */
router.post(
  '/:trapId/assign',
  authMiddleware(['ADMIN', 'SUPER_ADMIN']),
  assignCameraTrap
);

/**
 * POST /api/camera-traps/:trapId/unassign
 * Unassign CameraTrap from a ClientCompany
 * Accessible by: Company ADMIN and SUPER_ADMIN
 */
router.post(
  '/:trapId/unassign',
  authMiddleware(['ADMIN', 'SUPER_ADMIN']),
  unassignCameraTrap
);

// ==========================================
// Routes accessible by both COMPANY_USER and CLIENT_USER
// ==========================================

/**
 * GET /api/camera-traps
 * Get all CameraTraps
 * Company users: see all CameraTraps
 * Client users: see only CameraTraps assigned to their company
 */
router.get(
  '/',
  unifiedAuthMiddleware,
  getAllCameraTraps
);

/**
 * GET /api/camera-traps/:trapId
 * Get single CameraTrap by ID
 * Company users: can view any CameraTrap
 * Client users: can only view if assigned to their company
 */
router.get(
  '/:trapId',
  unifiedAuthMiddleware,
  getCameraTrap
);

/**
 * PUT /api/camera-traps/:trapId
 * Edit CameraTrap details
 * Company users: can edit any CameraTrap including assignment
 * Client users: can edit only if assigned to their company (cannot change assignment)
 */
router.put(
  '/:trapId',
  unifiedAuthMiddleware,
  editCameraTrap
);

/**
 * PATCH /api/camera-traps/:id/toggle
 * Toggle CameraTrap status (ACTIVE/INACTIVE)
 * Company users: can toggle any CameraTrap
 * Client users: can only toggle if assigned to their company and have ADMIN/SUPER_ADMIN role
 */
router.patch(
  '/:id/toggle',
  unifiedAuthMiddleware,
  toggleCameraTrapStatus
);

export default router;
