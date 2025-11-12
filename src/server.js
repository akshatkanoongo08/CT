import express from 'express';
import companyUserRoutes from './routes/companyUser.routes.js';
import onboardRoutes from './routes/onboard.routes.js';
import clientUserRoutes from './routes/clientUser.routes.js';
import cameraTrapRoutes from './routes/ct.routes.js';
import speciesOfInterestRoutes from './routes/speciesOfInterest.routes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
console.log('Setting up Express server...');
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ status: 'ok', message: 'Server is running' });
});

// Mount routes
console.log('Mounting company user routes at /api/company-users');
app.use('/api/company-users', companyUserRoutes);

console.log('Mounting onboard routes at /api/onboard');
app.use('/api/onboard', onboardRoutes);

console.log('Mounting client user routes at /api/client-users');
app.use('/api/client-users', clientUserRoutes);

console.log('Mounting camera trap routes at /api/camera-traps');
app.use('/api/camera-traps', cameraTrapRoutes);

console.log('Mounting species of interest routes at /api/species-of-interest');
app.use('/api/species-of-interest', speciesOfInterestRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/health`);
  console.log('\nRegistered routes:');
  console.log('- POST /api/camera-traps (add)');
  console.log('- GET /api/camera-traps (list)');
  console.log('- GET /api/camera-traps/:trapId (single)');
  console.log('- PUT /api/camera-traps/:trapId (edit)');
  console.log('- DELETE /api/camera-traps/:trapId (delete)');
  console.log('- POST /api/camera-traps/:trapId/assign');
  console.log('- POST /api/camera-traps/:trapId/unassign');
});