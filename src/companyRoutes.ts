// src/routes/companyRoutes.ts

import express from 'express';
import { InsuranceCompanyController } from './controllers/insurance/insuranceCompany.controller';
import { InsuranceBrokerController } from './controllers/insurance/insuranceBroker.controller'; // Import the broker controller
import { searchCompanyFromWeb, searchBrokerFromWeb } from './controllers/automation/scrapeCompanies';
import { validateApiKey } from './authMiddleware';

const router = express.Router();
const insuranceCompanyController = new InsuranceCompanyController();
const insuranceBrokerController = new InsuranceBrokerController(); // Initialize the broker controller

// ======================
// Insurance Company Routes
// ======================
router.post('/insurance/companies', validateApiKey, insuranceCompanyController.create.bind(insuranceCompanyController));
router.get('/insurance/companies', validateApiKey, insuranceCompanyController.findAll.bind(insuranceCompanyController));
router.get('/insurance/companies/', validateApiKey, insuranceCompanyController.findOne.bind(insuranceCompanyController));
router.put('/insurance/companies/', validateApiKey, insuranceCompanyController.update.bind(insuranceCompanyController));
router.delete('/insurance/companies/', validateApiKey, insuranceCompanyController.delete.bind(insuranceCompanyController));
router.get('/insurance/companies/search', validateApiKey, insuranceCompanyController.search.bind(insuranceCompanyController));

// Fetch pending companies
router.get('/insurance/companies/pending', validateApiKey, insuranceCompanyController.findPendingCompanies.bind(insuranceCompanyController));

// ======================
// Insurance Broker Routes
// ======================
router.post('/insurance/brokers', validateApiKey, insuranceBrokerController.create.bind(insuranceBrokerController));
router.get('/insurance/brokers', validateApiKey, insuranceBrokerController.findAll.bind(insuranceBrokerController));
router.get('/insurance/brokers/', validateApiKey, insuranceBrokerController.findOne.bind(insuranceBrokerController));
router.put('/insurance/brokers/', validateApiKey, insuranceBrokerController.update.bind(insuranceBrokerController));
router.delete('/insurance/brokers/', validateApiKey, insuranceBrokerController.delete.bind(insuranceBrokerController));
router.get('/insurance/brokers/search', validateApiKey, insuranceBrokerController.search.bind(insuranceBrokerController));

// Fetch pending brokers
router.get('/insurance/brokers/pending', validateApiKey, insuranceBrokerController.findPendingBrokers.bind(insuranceBrokerController));

// Company automations.
router.get('/insurance/companies/search-company', validateApiKey, searchCompanyFromWeb);
router.get('/insurance/brokers/search-broker', validateApiKey, searchBrokerFromWeb);

export default router;
