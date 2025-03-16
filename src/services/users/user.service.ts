import { Pool } from 'pg';
import pool from '../../config/db';
import { createFirebaseUser } from '../../utils/firebaseUtils';
import { sendWelcomeEmail, sendPasswordEmail } from '../../utils/emailUtils';

export class UserService {
    private pool: Pool;

    constructor() {
        this.pool = pool;
    }

    // Create a new user
    async create(userData: {
        fullName: string;
        email: string;
        phoneNumber?: string;
        role: string;
        insuranceEntityId: number;
        entityType: string;
        status?: string;
    }): Promise<any> {

        try {
            // Step 1: Generate a random password
            const password = this.generateRandomPassword();

            // Step 2: Create Firebase user
            const firebaseUser = await createFirebaseUser(userData.email, password);

            if (!firebaseUser) {
              throw new Error(`Firebase failed!`);
            }

            // Step 3: Save the user in the database
            const query = `
            INSERT INTO users (
                firebase_uid, full_name, email, phone_number, role,
                insurance_entity_id, entity_type, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
            `;
            const values = [
                firebaseUser.user.uid, // Firebase UID
                userData.fullName,
                userData.email,
                userData.phoneNumber,
                userData.role,
                userData.insuranceEntityId,
                userData.entityType,
                userData.status || 'active',
            ];
            const result = await this.pool.query(query, values);
            const user = result.rows[0];

            // Step 4: Send emails
            await sendWelcomeEmail(userData.email, userData.fullName); // Welcome email
            await sendPasswordEmail(userData.email, password); // Password email

            return user;
        } catch (error) {
            throw new Error(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate a random password for the user
     */
    private generateRandomPassword(): string {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    // Find all users
    async findAll(): Promise<any[]> {
        const query = 'SELECT * FROM users;';
        const result = await this.pool.query(query);
        return result.rows;
    }

    // Find one user by ID
    async findOne(id: number): Promise<any> {
        const query = 'SELECT * FROM users WHERE id = $1;';
        const result = await this.pool.query(query, [id]);
        return result.rows[0];
    }

    // Find one user by Firebase UID
    async findByFirebaseUid(firebaseUid: string): Promise<any> {
        const query = 'SELECT * FROM users WHERE firebase_uid = $1;';
        const result = await this.pool.query(query, [firebaseUid]);
        return result.rows[0];
    }

    async findByEmail(email: string): Promise<any> {
        const query = 'SELECT * FROM users WHERE email = $1;';
        const result = await this.pool.query(query, [email]);
        return result.rows[0];
    }

    // Update a user
    async update(id: number, updateData: Partial<{
        firebaseUid: string;
        fullName: string;
        email: string;
        phoneNumber?: string;
        role: string;
        insuranceEntityId: number;
        entityType: string;
        status?: string;
    }>): Promise<any> {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Map camelCase keys to snake_case column names
        const columnMap: Record<string, string> = {
            firebaseUid: 'firebase_uid',
            fullName: 'full_name',
            email: 'email',
            phoneNumber: 'phone_number',
            role: 'role',
            insuranceEntityId: 'insurance_entity_id',
            entityType: 'entity_type',
            status: 'status',
        };

        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) {
                const columnName = columnMap[key]; // Get the corresponding column name
                if (!columnName) {
                    throw new Error(`Invalid field: ${key}`);
                }
                fields.push(`${columnName} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
        values.push(id);

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    // Delete a user
    async delete(id: number): Promise<void> {
        const query = 'DELETE FROM users WHERE id = $1;';
        await this.pool.query(query, [id]);
    }

    // Search users by name, email, or phone number
    async search(query: string): Promise<any[]> {
        const searchQuery = `
      SELECT * FROM users
      WHERE full_name ILIKE $1 OR email ILIKE $1 OR phone_number ILIKE $1;
    `;
        const result = await this.pool.query(searchQuery, [`%${query}%`]);
        return result.rows;
    }

    // Find users by role
    async findByRole(role: string): Promise<any[]> {
        const query = 'SELECT * FROM users WHERE role = $1;';
        const result = await this.pool.query(query, [role]);
        return result.rows;
    }

    async findByUniqueFields(email: string, firebaseUid: string = ''): Promise<any> {
        const query = `
      SELECT * FROM users
      WHERE email = $1 OR firebase_uid = $2;
    `;
        const result = await this.pool.query(query, [email, firebaseUid]);
        return result.rows[0] || null; // Return the first match or null if no match is found
    }

    async findByUniqueFieldsExcludingId(email: string, firebaseUid: string, id: number): Promise<any> {
        const query = `
      SELECT * FROM users
      WHERE (email = $1 OR firebase_uid = $2) AND id != $3;
    `;
        const result = await this.pool.query(query, [email, firebaseUid, id]);
        return result.rows[0] || null; // Return the first match or null if no match is found
    }

    // Find users by insurance entity
    async findByInsuranceEntity(insuranceEntityId: number, entityType: string): Promise<any[]> {
        const query = 'SELECT * FROM users WHERE insurance_entity_id = $1 AND entity_type = $2;';
        const result = await this.pool.query(query, [insuranceEntityId, entityType]);
        return result.rows;
    }
}