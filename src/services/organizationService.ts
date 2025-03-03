import pool from "../config/db";

export const createOrganization = async (
    organization_type: string,
    legal_name: string,
    brela_number: string,
    tin_number: string,
    contact_email: string,
    contact_phone: string,
    company_details_url: string,
    tira_license?: string,
    admin_first_name?: string,
    admin_last_name?: string,
    admin_email?: string,
    physical_address?: string, // Stored as a json
    insurance_types?: string[], // Array of insurance types (strings)
    payment_methods?: { method: string; details: object }[]
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN"); // Start transaction

        // Insert organization
        const orgQuery = `
            INSERT INTO organizations (
                organization_type, legal_name, brela_number, tin_number, 
                contact_email, contact_phone, tira_license, 
                physical_address, insurance_types, payment_methods, company_details_url
            ) 
            VALUES (
                $1, $2, $3, $4, 
                $5, $6, $7, 
                $8, $9, $10, 
                $11
            ) 
            RETURNING id;
        `;

        const orgValues = [
            organization_type,
            legal_name,
            brela_number,
            tin_number,
            contact_email,
            contact_phone,
            tira_license || null,
            JSON.stringify(physical_address),
            JSON.stringify(insurance_types), // Convert insurance_type array to JSON string
            JSON.stringify(payment_methods),
            company_details_url,
        ];

        const orgResult = await client.query(orgQuery, orgValues);
        const organizationId = orgResult.rows[0].id;

        // Create the admin user
        if (admin_email) {
            await createUserDetails(
                client,
                admin_first_name || "",
                admin_last_name || "",
                admin_email,
                organizationId,
                "admin"
            );
        }

        await client.query("COMMIT"); // Commit transaction
        return {
            id: organizationId,
            legal_name,
            brela_number,
            tin_number,
            contact_email,
            contact_phone,
            tira_license,
        };
    } catch (error: unknown) {
        // Use unknown type for error
        await client.query("ROLLBACK"); // Rollback if any query fails
        console.error("Transaction error:", error);

        if (error instanceof Error && error.message) {
            if (error.message.includes("organization_type")) {
                throw new Error(`Organization type required.`);
            }
            // Check for unique constraint violation errors based on the unique fields
            if (error.message.includes("legal_name")) {
                throw new Error(
                    `Seems like the business '${legal_name}' already exists.`
                );
            }
            if (error.message.includes("brela_number")) {
                throw new Error(
                    `Seems like the BRELA number '${brela_number}' is already taken.`
                );
            }
            if (error.message.includes("tin_number")) {
                throw new Error(
                    `Seems like the TIN number '${tin_number}' is already registered.`
                );
            }
            if (error.message.includes("contact_email")) {
                throw new Error(
                    `An account with the email '${contact_email}' already exists.`
                );
            }
            if (error.message.includes("contact_phone")) {
                throw new Error(
                    `This contact phone number '${contact_phone}' is already associated with another account.`
                );
            }
            if (error.message.includes("admin_email")) {
                throw new Error(
                    `The admin email '${admin_email}' is already registered.`
                );
            }
        }

        throw new Error("Failed to create organization");
    } finally {
        client.release();
    }
};

export const createUserDetails = async (
    client: any, // Using the same client to ensure transaction consistency
    firstName: string,
    lastName: string,
    email: string,
    organizationId: number,
    role: string
) => {
    const userQuery = `
        INSERT INTO users 
        (first_name, last_name, email, phone_number, role, organization_id) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id;
    `;

    const userValues = [
        firstName, // Assuming first name is the first part of username
        lastName, // Assuming last name is the second part of username
        email,
        "555-0000", // Placeholder phone number
        role,
        organizationId,
    ];

    const userResult = await client.query(userQuery, userValues);
    const userId = userResult.rows[0].id;

    console.log(`User with ID: ${userId} created`);
};

export const logOrganizationMetadata = async (
    organizationId: number,
    action: string,
    modifiedBy: string,
    ipAddress: string,
    deviceType: string,
    operatingSystem: string,
    browser: string,
    geolocation: string
) => {
    const query = `
        INSERT INTO organization_metadata 
        (organization_id, action_type, modified_by, ip_address, device_type, operating_system, browser, geolocation, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `;

    const client = await pool.connect(); // Acquire a client from the pool
    try {
        await client.query("BEGIN"); // Start a transaction

        await client.query(query, [
            organizationId,
            action,
            modifiedBy,
            ipAddress,
            deviceType,
            operatingSystem,
            browser,
            geolocation,
        ]);

        await client.query("COMMIT"); // Commit the transaction
    } catch (error) {
        await client.query("ROLLBACK"); // Rollback transaction on error
        console.error("Error logging organization metadata:", error);
    } finally {
        client.release(); // Always release the client back to the pool
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

export const fetchPendingCompaniesQuery = async () => {
    const client = await pool.connect(); // Establish DB connection
    try {
        const query = `
            SELECT 
                o.*,
                m.organization_id,
                m.action_type,
                m.modified_by,
                m.ip_address,
                m.device_type,
                m.operating_system,
                m.browser,
                m.geolocation,
                m.timestamp
            FROM organizations o
            LEFT JOIN organization_metadata m ON o.id = m.organization_id
            WHERE o.account_status = 'pending';
        `;

        const result = await client.query(query);

        return  {
            success: true,
            count: result.rows.length,
            companies: result.rows
        };
    } catch (error) {
        console.error("Error fetching pending companies:", error);
        throw new Error("Failed to fetch pending companies");
    } finally {
        client.release(); // Release the DB connection
    }
};

export const approveCompany = async (companyId: number) => {
    const client = await pool.connect(); // Establish DB connection
    try {
        // Update query to change the company status to approved
        const query = `
            UPDATE organizations
            SET account_status = 'approved'
            WHERE id = $1
            RETURNING id, account_status;
        `;

        const result = await client.query(query, [companyId]);

        // Check if the company was updated
        if (result.rows.length > 0) {
            return {
                success: true,
                message: "Company approved successfully",
                company: result.rows[0]
            };
        } else {
            throw new Error("Company not found or already approved");
        }
    } catch (error) {
        console.error("Error approving company:", error);
        throw new Error("Failed to approve company");
    } finally {
        client.release(); // Release the DB connection
    }
};


