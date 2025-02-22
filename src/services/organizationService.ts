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
            admin_username, admin_email, insurance_types, payment_methods) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
            RETURNING id;
        `;

        const orgValues = [
            legal_name, brela_number, tin_number, contact_email, contact_phone, tira_license || null,
            contact_person_first_name, contact_person_last_name, contact_person_role || null, contact_person_email, contact_person_phone,
            admin_username, admin_email, JSON.stringify(insurance_types),  // Convert insurance_type array to JSON string
            JSON.stringify(payment_methods)
        ];

        const orgResult = await client.query(orgQuery, orgValues);
        const organizationId = orgResult.rows[0].id;

        await client.query('COMMIT'); // Commit transaction
        return { id: organizationId, legal_name, brela_number, tin_number, contact_email, contact_phone, tira_license };
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback if any query fails
        console.error('Transaction error:', error);
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

