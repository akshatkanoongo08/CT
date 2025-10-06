import express from 'express';
import {
  loginClientUser,
  addClientUser,
  getAllClientUsers,
  updateClientUser,
  deleteClientUser,
  changeClientUserPassword,
} from '../controllers/clientUser.controller.js';
import { validateClientCompany } from '../middlewares/clientCompany.middleware.js';

const router = express.Router();

// ==========================================
// Public routes
// ==========================================

/**
 * POST /api/client-users/login
 * Login for client users
 */
router.post('/login', loginClientUser);

// ==========================================
// Protected routes (require authentication and active company)
// ==========================================

/**
 * POST /api/client-users
 * Add a new client user
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
router.post('/', validateClientCompany, addClientUser);

/**
 * GET /api/client-users
 * Get all users in the client's company
 * Accessible by: All authenticated client users
 */
router.get('/', validateClientCompany, getAllClientUsers);

/**
 * PUT /api/client-users/:userId
 * Update a client user
 * Accessible by: CLIENT_USER with SUPER_ADMIN or ADMIN role
 */
router.put('/:userId', validateClientCompany, updateClientUser);

/**
 * DELETE /api/client-users/:userId
 * Delete a client user
 * Accessible by: CLIENT_USER with SUPER_ADMIN role only
 */
router.delete('/:userId', validateClientCompany, deleteClientUser);

/**
 * POST /api/client-users/change-password
 * Change own password
 * Accessible by: Any authenticated client user
 */
router.post('/change-password', validateClientCompany, changeClientUserPassword);

export default router;
