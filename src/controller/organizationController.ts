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
            contact_person_name,
            contact_person_role,
            contact_person_email,
            contact_person_phone,
            admin_username,
            admin_email,
            insurance_type,
            payment_method
        } = req.body;

        // Call service function to create organization
        const newOrg = await createOrganization(
            legal_name,
            brela_number,
            tin_number,
            contact_email,
            contact_phone,
            tira_license,
            contact_person_name,
            contact_person_role,
            contact_person_email,
            contact_person_phone,
            admin_username,
            admin_email,
            insurance_type,
            payment_method
        );

        return res.status(201).json({ success: true, data: newOrg });
    } catch (error) {
        console.error("Error in addOrganization:", error);
        return res.status(500).json({ success: false, message: "Error creating organization" });
    }
};

export const removeOrganization = async (req: Request, res: Response) => {
    try {
        const organizationId = parseInt(req.params.id);

        // Validate if the organizationId is valid
        if (isNaN(organizationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid organization ID",
            });
        }

        // Call the service function to delete the organization
        const result = await deleteOrganization(organizationId);

        // Check if the deletion was successful and respond accordingly
        return res.status(200).json({
            success: true,
            message: `Organization with ID ${result.id} has been deleted.`,
            data: { id: result.id },
        });
    } catch (error) {
        console.error("Error in removeOrganization:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting organization",
        });
    }
};

