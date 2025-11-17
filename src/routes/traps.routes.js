import express from 'express';
import detectionController from '../controllers/detection.controller.js';

const router = express.Router();

// POST /api/traps/lookup
router.post('/lookup', detectionController.lookupTrap);

export default router;
