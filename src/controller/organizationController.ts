import { Request, Response, NextFunction } from 'express';
import requestIp from 'request-ip';
import useragent from 'useragent';
import { getOrganizationIdByEmail, addCustomerAndLinkToOrganization, approveCompany, createOrganization, fetchPendingCompaniesQuery, logOrganizationMetadata, deleteOrganization } from '../services/organizationService';
import { sendWelcomeEmail, sendPasswordEmail } from '../services/emailService';
import { createAccount, login, logout, isUserLoggedIn } from '../services/firestoreService';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const addOrganization = async (req: Request, res: Response) => {
    try {
        const {
            organization_type,
            legal_name,
            brela_number,
            tin_number,
            contact_email,
            contact_phone,
            company_details_url,
            tira_license,
            admin_first_name,
            admin_last_name,
            admin_email,
            physical_address,
            insurance_types,
            payment_methods,
            geolocation,
        } = req.body;

        // Ensure insurance_type and payment_method are arrays
        if (!Array.isArray(insurance_types)) {
            res.status(400).json({ success: false, message: 'insurance_types must be an array of strings.' });
            return;
        }

        if (!Array.isArray(payment_methods)) {
            res.status(400).json({ success: false, message: 'payment_methods must be an array of payment details objects.' });
            return;
        }

        const newfirebaseAccountDetails = await createAccount(admin_email);

        let userCredential = null;
        let adminFirebaseUid = '';
        let new_password = '';

        if (newfirebaseAccountDetails) {
            // Destructure the userCredential and password from newfirebaseAccountDetails
            const { userCredential, password } = newfirebaseAccountDetails;

            // Check if userCredential exists before accessing uid
            if (userCredential) {
                adminFirebaseUid = userCredential.user.uid;
                new_password = password;
            } else {
                // Handle the case where userCredential is missing
                res.status(400).json({ success: false, message: 'User credential is missing.' });
                return;
            }
        } else {
            res.status(400).json({ success: false, message: 'Failed to create firebase account.' });
            return;
        }


        // Call service function to create organization
        const newOrg = await createOrganization(
            organization_type,
            legal_name,
            brela_number,
            tin_number,
            contact_email,
            contact_phone,
            company_details_url,
            tira_license,
            adminFirebaseUid,
            admin_first_name,
            admin_last_name,
            admin_email,
            physical_address,
            insurance_types,
            payment_methods
        );

        // Capture metadata
        const clientIp = requestIp.getClientIp(req) || 'Unknown IP';
        const agent = useragent.parse(req.headers['user-agent']);
        const deviceType = agent.device.toString() || 'Unknown Device';
        const operatingSystem = agent.os.toString() || 'Unknown OS';
        const browser = agent.family || 'Unknown Browser';

        // Log metadata
        await logOrganizationMetadata(
            newOrg.id,
            'created',
            admin_first_name + " " + admin_last_name,
            clientIp,
            deviceType,
            operatingSystem,
            browser,
            geolocation
        );

        await sendWelcomeEmail(admin_email, legal_name);

        // Check if account creation was successful
        if (new_password) {
            await sendPasswordEmail(admin_email, new_password, process.env.BASE_URL + '/authentication/login');
        } else {
            console.error('Failed to create account');
        }

        res.status(201).json({ success: true, data: newOrg });
        return;
    } catch (error) {
        console.error("Error in addOrganization:", error);
        var extra_message = '';
        if (error instanceof Error && error.message) {
            extra_message = error.message;
        }
        res.status(500).json({ success: false, message: "Error creating organization: " + extra_message });
        return;
    }
};

export const removeOrganization = async (req: Request, res: Response) => {
    try {
        const organizationId = parseInt(req.params.id, 10);

        // Validate if the organizationId is valid
        if (isNaN(organizationId)) {
            res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
            return;
        }

        // Call the service function to delete the organization
        const result = await deleteOrganization(organizationId);

        // Check if the deletion was successful and respond accordingly
        res.status(200).json({
            success: true,
            message: `Organization with ID ${result.id} has been deleted.`,
            data: { id: result.id },
        });
        return;
    } catch (error) {
        console.error("Error in removeOrganization:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting organization",
        });
        return;
    }
};

export const approveNewCompany = async (req: Request, res: Response) => {
    try {
        const {
            organization_id,
            dev_password
        } = req.body;

        // Check if the dev password is correct
        if (String(process.env.DEV_PASS) !== dev_password) {
            res.status(401).json({ // 401 Unauthorized for wrong password
                success: false,
                message: "Incorrect dev password!",
            });
            return;
        }

        const organizationId = parseInt(organization_id, 10);

        // Validate if the organizationId is valid
        if (isNaN(organizationId)) {
            res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
            return;
        }

        // Call the service function to delete the organization
        const result = await approveCompany(organizationId);

        // Check if the deletion was successful and respond accordingly
        res.status(200).json({
            success: true,
            message: `Organization with ID ${result.company.id} has been approved.`,
            data: { id: result.company.id },
        });
        return;
    } catch (error) {
        console.error("Error in approving company:", error);
        res.status(500).json({
            success: false,
            message: "Error approving company",
        });
        return;
    }
};

export const fetchPendingCompanies = async (req: Request, res: Response) => {
    try {
        const pendingCompanyDetails = await fetchPendingCompaniesQuery();
        res.json(pendingCompanyDetails);
    } catch (error) {
        console.error("Error fetching pending companies:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logUserIn = async (req: Request, res: Response) => {
    try {
        // Extract email and password from the request body
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        // Call the login function
        const result = await login(email, password);

        // Check if login was successful
        if (!result) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const organizationId = await getOrganizationIdByEmail(email);

        if (!organizationId) {
            res.status(401).json({ message: 'Invalid organization id' });
            return;
        }

        // Send back the user data and token
        res.status(200).json({
            message: 'Login successful',
            user: {
                uid: result.userCredential.user.uid,
                email: result.userCredential.user.email,
                organization_id: organizationId,
            },
            token: result.token, // Send the authentication token
        });
        return;
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};

// Function to handle user logout
export const logUserOut = async (req: Request, res: Response) => {
    try {
        // Extract the email from the request body
        const { email } = req.body;

        // Validate email input
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        await logout(email);

        // Send back a success response
        res.status(200).json({
            message: 'Logout successful',
        });

        return;
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });

        return;
    }
};


// Middleware to verify if the user is logged in
export const verifyUserLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the token from the Authorization header (usually as Bearer token)
        const token = req.headers.authorization?.split(' ')[1]; // Assumes token is sent as 'Bearer <token>'

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        // Verify the token using the isUserLoggedIn function
        const user = await isUserLoggedIn(token);

        if (!user) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
};

export const addCustomer = async (req: Request, res: Response) => {
    try {
        const {
            first_name,
            last_name,
            gender,
            marital_status,
            physical_address,
            national_id,
            drivers_license,
            passport_number,
            email,
            phone_number,
            organization_id
        } = req.body;

        // Call service function to create organization
        const newCustomer = await addCustomerAndLinkToOrganization(
            first_name,
            last_name,
            gender,
            marital_status,
            physical_address,
            national_id,
            drivers_license,
            passport_number,
            email,
            phone_number,
            organization_id
        );

        // Send some emails here.

        res.status(201).json({ success: true, data: newCustomer });
        return;
    } catch (error) {
        console.error("Error in addCustomer:", error);
        var extra_message = '';
        if (error instanceof Error && error.message) {
            extra_message = error.message;
        }
        res.status(500).json({ success: false, message: "Error creating organization: " + extra_message });
        return;
    }
};


