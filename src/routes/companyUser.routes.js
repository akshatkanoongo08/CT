import express from 'express';
import {
  addAdminUser,
  loginAdminUser,
  requestPasswordReset,
  verifyResetCodeAndUpdatePassword,
  setupPassword,
  editAdminUser,
  viewAdminUser,
  getAdminProfile,
  getAllClients,
} from '../controllers/companyUser.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdminUser);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-reset-code', verifyResetCodeAndUpdatePassword);
router.post('/setup-password', setupPassword);

// Protected routes
router.post('/add', authMiddleware(['SUPER_ADMIN']), addAdminUser);
router.put('/:id', authMiddleware(['SUPER_ADMIN']), editAdminUser);
router.get('/', authMiddleware(['SUPER_ADMIN', 'ADMIN']), viewAdminUser);
router.get('/profile', authMiddleware(['SUPER_ADMIN', 'ADMIN', 'GENERAL']), getAdminProfile);
router.get('/clients', authMiddleware(['SUPER_ADMIN', 'ADMIN']), getAllClients);

export default router;