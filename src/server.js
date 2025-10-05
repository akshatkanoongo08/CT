import express from 'express';
import companyUserRoutes from './routes/companyUser.routes.js';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
app.use(cors());
dotenv.config();
app.use(express.json());
app.use('/api/company-users', companyUserRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));