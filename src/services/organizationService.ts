import pool from '../config/db';

export const createOrganization = async (
    legal_name: string,
    brela_number: string,
    tin_number: string,
    contact_email: string,
    contact_phone: string,
    tira_license?: string,
    contact_person_first_name?: string,
    contact_person_last_name?: string,
    contact_person_role?: string,
    contact_person_email?: string,
    contact_person_phone?: string,
    admin_username?: string,
    admin_email?: string,
    physical_address?: string, // Stored as a json
    insurance_types?: string[],  // Array of insurance types (strings)
    payment_methods?: { method: string; details: object }[] 
) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start transaction

        // Insert organization
        const orgQuery = `
            INSERT INTO organizations 
            (legal_name, brela_number, tin_number, contact_email, contact_phone, tira_license, 
            contact_person_first_name, contact_person_last_name, contact_person_role, contact_person_email, contact_person_phone, 
            admin_username, admin_email, physical_address, insurance_types, payment_methods) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
            RETURNING id;
        `;

        const orgValues = [
            legal_name, brela_number, tin_number, contact_email, contact_phone, tira_license || null,
            contact_person_first_name, contact_person_last_name, contact_person_role || null, contact_person_email, contact_person_phone,
            admin_username, admin_email, JSON.stringify(physical_address), JSON.stringify(insurance_types),  // Convert insurance_type array to JSON string
            JSON.stringify(payment_methods)
        ];

        const orgResult = await client.query(orgQuery, orgValues);
        const organizationId = orgResult.rows[0].id;

        await client.query('COMMIT'); // Commit transaction
        return { id: organizationId, legal_name, brela_number, tin_number, contact_email, contact_phone, tira_license };
    } catch (error: unknown) {  // Use unknown type for error
        await client.query('ROLLBACK'); // Rollback if any query fails
        console.error('Transaction error:', error);

        if (error instanceof Error && error.message) {
            // Check for unique constraint violation errors based on the unique fields
            if (error.message.includes('legal_name')) {
                throw new Error(`Seems like the business '${legal_name}' already exists.`);
            }
            if (error.message.includes('brela_number')) {
                throw new Error(`Seems like the BRELA number '${brela_number}' is already taken.`);
            }
            if (error.message.includes('tin_number')) {
                throw new Error(`Seems like the TIN number '${tin_number}' is already registered.`);
            }
            if (error.message.includes('contact_email')) {
                throw new Error(`An account with the email '${contact_email}' already exists.`);
            }
            if (error.message.includes('contact_phone')) {
                throw new Error(`This contact phone number '${contact_phone}' is already associated with another account.`);
            }
            if (error.message.includes('admin_username')) {
                throw new Error(`The admin username '${admin_username}' is already in use.`);
            }
            if (error.message.includes('admin_email')) {
                throw new Error(`The admin email '${admin_email}' is already registered.`);
            }
        }

        throw new Error('Failed to create organization');
    } finally {
        client.release();
    }
};


export const deleteOrganization = async (organizationId: number) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN"); // Start transaction

        // Finally, delete the organization itself
        const deleteOrgQuery = `
            DELETE FROM organizations WHERE id = $1 RETURNING id;
        `;
        const result = await client.query(deleteOrgQuery, [organizationId]);

        const deletedId = result.rows[0]?.id;

        await client.query("COMMIT"); // Commit transaction

        if (deletedId) {
            return { id: deletedId }; // Return the id of the deleted organization
        } else {
            throw new Error("Organization not found");
        }
    } catch (error) {
        await client.query("ROLLBACK"); // Rollback if any query fails
        console.error("Error deleting organization:", error);
        throw new Error("Failed to delete organization");
    } finally {
        client.release();
    }
};

