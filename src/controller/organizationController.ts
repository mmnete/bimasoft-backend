import { Request, Response } from 'express';
import requestIp from 'request-ip';
import useragent from 'useragent';
import { approveCompany, createOrganization, fetchPendingCompaniesQuery, logOrganizationMetadata, deleteOrganization } from '../services/organizationService';
import { sendWelcomeEmail, sendPasswordEmail } from '../services/emailService';
import { createAccount } from '../services/firestoreService';
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

        const newAccountDetails = await createAccount(newOrg.id, admin_email);

        // Check if account creation was successful
        if (newAccountDetails) {
            const { userCredential, password } = newAccountDetails;
            // Now you can send the password to the user via email
            await sendPasswordEmail(admin_email, password, process.env.BASE_URL + '/authentication/login');
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
