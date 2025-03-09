import express, { Request, Response, NextFunction } from 'express';
import { approveNewCompany, addCustomer, addOrganization, fetchPendingCompanies, removeOrganization, logUserIn, logUserOut, verifyUserLoggedIn  } from './controller/organizationController';
import { searchCompany } from './controller/scrapeCompanies';

const router = express.Router();
const API_KEY: string | undefined = process.env.API_KEY;

// Middleware to validate API key
const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey: string | undefined = req.headers['x-api-key'] as string;
    if (!apiKey || apiKey !== API_KEY) {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    next();
};

// Test route
router.get('/test', validateApiKey, (req: Request, res: Response): void => {
    res.send('yes');
});
router.get('/pending-companies', validateApiKey, fetchPendingCompanies);
router.post('/approve-company', validateApiKey, approveNewCompany);
// Protected routes
router.post('/add-customer', validateApiKey, addCustomer);
router.post('/add-organization', validateApiKey, addOrganization);
router.delete('/remove-organization/:id', validateApiKey, removeOrganization);
router.get('/search-company', validateApiKey, searchCompany);
// New Endpoint for User Login (POST)
router.post('/login', validateApiKey, logUserIn); // This is the login endpoint
router.post('/logout', validateApiKey, logUserOut);
// New Endpoint for Checking if User is Logged In (GET)
router.get('/check-logged-in', validateApiKey, verifyUserLoggedIn, (req: Request, res: Response) => {
    res.status(200).json({ message: 'User is logged in' });
});

export default router;
