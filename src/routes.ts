// src/routes/index.ts

import express from 'express';
import companyRoutes from './companyRoutes'; // Import the companyRoutes
import userRoutes from './userRoutes';
import motorRoutes from './motorRoutes';
import { validateApiKey } from './authMiddleware';

const router = express.Router();

// Mount companyRoutes under /api/v1
router.use('/api/v1', companyRoutes);
router.use('/api/v1', motorRoutes);
router.use('/api/v1', userRoutes);

// Test route
router.get('/test', validateApiKey, (req, res) => {
    res.send('yes');
});

// // Export the main router
export default router;
