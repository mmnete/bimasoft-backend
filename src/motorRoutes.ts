import express from 'express';
import { getMotorDetails } from './controllers/automation/motorController';
import { validateApiKey } from './authMiddleware';

const router = express.Router();

// Define the route
router.get('/motor-details', validateApiKey, getMotorDetails);

export default router;
