import { Request, Response } from 'express';
import { createOrganization, deleteOrganization } from '../services/organizationService';

export const addOrganization = async (req: Request, res: Response) => {
    try {
        const {
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
            insurance_types,
            payment_methods
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
            insurance_types,
            payment_methods
        );

         res.status(201).json({ success: true, data: newOrg });
         return;
    } catch (error) {
        console.error("Error in addOrganization:", error);
        res.status(500).json({ success: false, message: "Error creating organization" });
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

