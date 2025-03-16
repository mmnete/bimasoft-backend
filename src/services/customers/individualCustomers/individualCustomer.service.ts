import { Pool } from 'pg';
import pool from '../../../config/db';

export class IndividualCustomerService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Create a new individual customer
  async create(individualCustomerData: {
    customerId: number;
    nationalId: string;
    driversLicense?: string;
    passportNumber?: string;
    gender?: string;
    maritalStatus?: string;
  }): Promise<any> {
    const query = `
      INSERT INTO individual_customers (
        customer_id, national_id, drivers_license, passport_number, gender, marital_status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      individualCustomerData.customerId,
      individualCustomerData.nationalId,
      individualCustomerData.driversLicense,
      individualCustomerData.passportNumber,
      individualCustomerData.gender,
      individualCustomerData.maritalStatus,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Find all individual customers
  async findAll(): Promise<any[]> {
    const query = 'SELECT * FROM individual_customers;';
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Find one individual customer by ID
  async findOne(id: number): Promise<any> {
    const query = 'SELECT * FROM individual_customers WHERE id = $1;';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  // Update an individual customer
  async update(id: number, updateData: Partial<{
    customerId: number;
    nationalId: string;
    driversLicense?: string;
    passportNumber?: string;
    gender?: string;
    maritalStatus?: string;
  }>): Promise<any> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE individual_customers
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    values.push(id);

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Delete an individual customer
  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM individual_customers WHERE id = $1;';
    await this.pool.query(query, [id]);
  }

  // Find an individual customer by national ID
  async findByNationalId(nationalId: string): Promise<any> {
    const query = `
      SELECT * FROM individual_customers
      WHERE national_id = $1;
    `;
    const result = await this.pool.query(query, [nationalId]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }

  // Find an individual customer by national ID, excluding a specific ID
  async findByNationalIdExcludingId(nationalId: string, id: number): Promise<any> {
    const query = `
      SELECT * FROM individual_customers
      WHERE national_id = $1 AND id != $2;
    `;
    const result = await this.pool.query(query, [nationalId, id]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }
}
