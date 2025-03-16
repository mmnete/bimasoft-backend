import { Pool } from 'pg';
import pool from '../../config/db';

export class CustomerService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Create a new customer
  async create(customerData: {
    customerType: string;
    legalName: string;
    contactEmail?: string;
    contactPhone?: string;
    physicalAddress: string;
    tinNumber: string;
  }): Promise<any> {
    const query = `
      INSERT INTO customers (
        customer_type, legal_name, contact_email, contact_phone,
        physical_address, tin_number
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      customerData.customerType,
      customerData.legalName,
      customerData.contactEmail,
      customerData.contactPhone,
      customerData.physicalAddress,
      customerData.tinNumber,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Find all customers
  async findAll(): Promise<any[]> {
    const query = 'SELECT * FROM customers;';
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Find one customer by ID
  async findOne(id: number): Promise<any> {
    const query = 'SELECT * FROM customers WHERE id = $1;';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  // Find customers by type (individual or corporate)
  async findByType(customerType: string): Promise<any[]> {
    const query = 'SELECT * FROM customers WHERE customer_type = $1;';
    const result = await this.pool.query(query, [customerType]);
    return result.rows;
  }

  async findByUniqueFields(legalName: string, tinNumber: string, nationalId?: string): Promise<any> {
    const query = `
      SELECT * FROM customers
      WHERE legal_name = $1 OR tin_number = $2 OR national_id = $3;
    `;
    const result = await this.pool.query(query, [legalName, tinNumber, nationalId || null]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }
  
  async findByUniqueFieldsExcludingId(legalName: string, tinNumber: string, nationalId: string, id: number): Promise<any> {
    const query = `
      SELECT * FROM customers
      WHERE (legal_name = $1 OR tin_number = $2 OR national_id = $3) AND id != $4;
    `;
    const result = await this.pool.query(query, [legalName, tinNumber, nationalId, id]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }

  // Update a customer
  async update(id: number, updateData: Partial<{
    customerType: string;
    legalName: string;
    contactEmail?: string;
    contactPhone?: string;
    physicalAddress: string;
    tinNumber: string;
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
      UPDATE customers
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    values.push(id);

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Delete a customer
  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM customers WHERE id = $1;';
    await this.pool.query(query, [id]);
  }

  // Search customers by name, email, or phone number
  async search(query: string): Promise<any[]> {
    const searchQuery = `
      SELECT * FROM customers
      WHERE legal_name ILIKE $1 OR contact_email ILIKE $1 OR contact_phone ILIKE $1;
    `;
    const result = await this.pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }

  // Find customers by TIN number
  async findByTinNumber(tinNumber: string): Promise<any> {
    const query = 'SELECT * FROM customers WHERE tin_number = $1;';
    const result = await this.pool.query(query, [tinNumber]);
    return result.rows[0];
  }
}