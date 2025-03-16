import { Pool } from 'pg';
import pool from '../../config/db';

export class PolicyService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Create a new policy
  async create(policyData: {
    policyNumber: string;
    customerId: number;
    insuranceEntityId: number;
    entityType: string;
    policyType: string;
    startDate: Date;
    endDate: Date;
    premiumAmount: number;
    status?: string;
  }): Promise<any> {
    const query = `
      INSERT INTO policies (
        policy_number, customer_id, insurance_entity_id, entity_type,
        policy_type, start_date, end_date, premium_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      policyData.policyNumber,
      policyData.customerId,
      policyData.insuranceEntityId,
      policyData.entityType,
      policyData.policyType,
      policyData.startDate,
      policyData.endDate,
      policyData.premiumAmount,
      policyData.status || 'active',
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Find all policies
  async findAll(): Promise<any[]> {
    const query = 'SELECT * FROM policies;';
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Find one policy by ID
  async findOne(id: number): Promise<any> {
    const query = 'SELECT * FROM policies WHERE id = $1;';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  // Find policies by customer ID
  async findByCustomerId(customerId: number): Promise<any[]> {
    const query = 'SELECT * FROM policies WHERE customer_id = $1;';
    const result = await this.pool.query(query, [customerId]);
    return result.rows;
  }

  // Find policies by insurance entity ID and type
  async findByInsuranceEntity(insuranceEntityId: number, entityType: string): Promise<any[]> {
    const query = 'SELECT * FROM policies WHERE insurance_entity_id = $1 AND entity_type = $2;';
    const result = await this.pool.query(query, [insuranceEntityId, entityType]);
    return result.rows;
  }

  // Update a policy
  async update(id: number, updateData: Partial<{
    policyNumber: string;
    customerId: number;
    insuranceEntityId: number;
    entityType: string;
    policyType: string;
    startDate: Date;
    endDate: Date;
    premiumAmount: number;
    status: string;
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
      UPDATE policies
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    values.push(id);

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Delete a policy
  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM policies WHERE id = $1;';
    await this.pool.query(query, [id]);
  }

  // Search policies by policy number or customer name
  async search(query: string): Promise<any[]> {
    const searchQuery = `
      SELECT p.* FROM policies p
      JOIN customers c ON p.customer_id = c.id
      WHERE p.policy_number ILIKE $1 OR c.legal_name ILIKE $1;
    `;
    const result = await this.pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }

  // Find policies by status
  async findByStatus(status: string): Promise<any[]> {
    const query = 'SELECT * FROM policies WHERE status = $1;';
    const result = await this.pool.query(query, [status]);
    return result.rows;
  }

  async findByPolicyNumber(policyNumber: string): Promise<any> {
    const query = `
      SELECT * FROM policies
      WHERE policy_number = $1;
    `;
    const result = await this.pool.query(query, [policyNumber]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }
  
  async findByPolicyNumberExcludingId(policyNumber: string, id: number): Promise<any> {
    const query = `
      SELECT * FROM policies
      WHERE policy_number = $1 AND id != $2;
    `;
    const result = await this.pool.query(query, [policyNumber, id]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }
}