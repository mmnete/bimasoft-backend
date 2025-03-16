// src/routes/userRoutes.ts

import express from 'express';
import { UserController } from './controllers/users/user.controller';
import { validateApiKey } from './authMiddleware';

const router = express.Router();
const userController = new UserController();

// User Routes
router.post('/users', validateApiKey, userController.create.bind(userController));
router.get('/users', validateApiKey, userController.findAll.bind(userController));
router.get('/users/:id', validateApiKey, userController.findOne.bind(userController));
router.put('/users/:id', validateApiKey, userController.update.bind(userController));
router.delete('/users/:id', validateApiKey, userController.delete.bind(userController));
router.get('/users/search', validateApiKey, userController.search.bind(userController));
router.get('/users/role/:role', validateApiKey, userController.findByRole.bind(userController));
router.get('/users/insurance-entity/:insuranceEntityId/:entityType', validateApiKey, userController.findByInsuranceEntity.bind(userController));

// Authentication Routes
router.post('/login', validateApiKey, userController.login.bind(userController));
router.post('/logout', validateApiKey, userController.logout.bind(userController));

// Check if user is logged in
router.get('/check-logged-in', validateApiKey, userController.checkLoggedIn.bind(userController));

export default router;