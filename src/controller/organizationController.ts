import { Request, Response } from 'express';
import requestIp from 'request-ip';
import useragent from 'useragent';
import { createOrganization, logOrganizationMetadata, deleteOrganization } from '../services/organizationService';
import axios from 'axios';
import { sendWelcomeEmail } from '../services/emailService';

export const getGeolocation = async (req: Request): Promise<string> => {
    try {
        const clientIp = requestIp.getClientIp(req) || 'Unknown IP';
        if (clientIp === 'Unknown IP') return 'Unknown Location';

        const response = await axios.get(`http://ip-api.com/json/${clientIp}`);
        if (response.data.status === 'success') {
            return `${response.data.country}, ${response.data.city}`;
        }
        return 'Unknown Location';
    } catch (error) {
        console.error('Error fetching geolocation:', error);
        return 'Unknown Location';
    }
};

export const addOrganization = async (req: Request, res: Response) => {
    try {
        const {
            organization_type,
            legal_name,
            brela_number,
            tin_number,
            contact_email,
            contact_phone,
            tira_license,
            contact_person_first_name,
            contact_person_last_name,
            contact_person_role,
            contact_person_email,
            contact_person_phone,
            admin_username,
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
            tira_license,
            contact_person_first_name,
            contact_person_last_name,
            contact_person_role,
            contact_person_email,
            contact_person_phone,
            admin_username,
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
            admin_username,
            clientIp,
            deviceType,
            operatingSystem,
            browser,
            geolocation
        );

        // await sendWelcomeEmail(contact_email, legal_name);
        await sendWelcomeEmail(admin_email, legal_name);

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

