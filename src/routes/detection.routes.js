import express from 'express';
import detectionController from '../controllers/detection.controller.js';
import { validateClientCompany } from '../middlewares/clientCompany.middleware.js';

const router = express.Router();

// POST /api/detection - called by model-research to store detections
router.post('/detection', detectionController.storeDetection);

// GET /api/client/incidents/latest - accessible only to client users
router.get('/client/incidents/latest', validateClientCompany, detectionController.getLatestIncidentsForClient);

export default router;
