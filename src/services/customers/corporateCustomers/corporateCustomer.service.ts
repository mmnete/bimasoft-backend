import { Pool } from 'pg';
import pool from '../../../config/db';

export class CorporateCustomerService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Create a new corporate customer
  async create(corporateCustomerData: {
    customerId: number;
    brelaRegistrationNumber: string;
    companyDetailsUrl?: string;
  }): Promise<any> {
    const query = `
      INSERT INTO corporate_customers (
        customer_id, brela_registration_number, company_details_url
      ) VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [
      corporateCustomerData.customerId,
      corporateCustomerData.brelaRegistrationNumber,
      corporateCustomerData.companyDetailsUrl,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Find all corporate customers
  async findAll(): Promise<any[]> {
    const query = 'SELECT * FROM corporate_customers;';
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Find one corporate customer by ID
  async findOne(id: number): Promise<any> {
    const query = 'SELECT * FROM corporate_customers WHERE id = $1;';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  // Update a corporate customer
  async update(id: number, updateData: Partial<{
    customerId: number;
    brelaRegistrationNumber: string;
    companyDetailsUrl?: string;
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
      UPDATE corporate_customers
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    values.push(id);

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Delete a corporate customer
  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM corporate_customers WHERE id = $1;';
    await this.pool.query(query, [id]);
  }

  // Find a corporate customer by BRELA registration number
  async findByBrelaRegistrationNumber(brelaRegistrationNumber: string): Promise<any> {
    const query = `
      SELECT * FROM corporate_customers
      WHERE brela_registration_number = $1;
    `;
    const result = await this.pool.query(query, [brelaRegistrationNumber]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }

  // Find a corporate customer by BRELA registration number, excluding a specific ID
  async findByBrelaRegistrationNumberExcludingId(brelaRegistrationNumber: string, id: number): Promise<any> {
    const query = `
      SELECT * FROM corporate_customers
      WHERE brela_registration_number = $1 AND id != $2;
    `;
    const result = await this.pool.query(query, [brelaRegistrationNumber, id]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }
}