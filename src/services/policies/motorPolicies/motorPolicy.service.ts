import { Pool } from 'pg';
import pool from '../../../config/db';

export class MotorPolicyService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Create a new motor policy
  async create(motorPolicyData: {
    policyId: number;
    vehicleRegistrationNumber: string;
    make: string;
    model: string;
    yearOfManufacture: number;
    chassisNumber: string;
    engineNumber: string;
  }): Promise<any> {
    const query = `
      INSERT INTO motor_policies (
        policy_id, vehicle_registration_number, make, model,
        year_of_manufacture, chassis_number, engine_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      motorPolicyData.policyId,
      motorPolicyData.vehicleRegistrationNumber,
      motorPolicyData.make,
      motorPolicyData.model,
      motorPolicyData.yearOfManufacture,
      motorPolicyData.chassisNumber,
      motorPolicyData.engineNumber,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Find all motor policies
  async findAll(): Promise<any[]> {
    const query = 'SELECT * FROM motor_policies;';
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Find one motor policy by ID
  async findOne(id: number): Promise<any> {
    const query = 'SELECT * FROM motor_policies WHERE id = $1;';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  // Find motor policy by policy ID
  async findByPolicyId(policyId: number): Promise<any> {
    const query = 'SELECT * FROM motor_policies WHERE policy_id = $1;';
    const result = await this.pool.query(query, [policyId]);
    return result.rows[0];
  }

  // Update a motor policy
  async update(id: number, updateData: Partial<{
    vehicleRegistrationNumber: string;
    make: string;
    model: string;
    yearOfManufacture: number;
    chassisNumber: string;
    engineNumber: string;
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
      UPDATE motor_policies
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    values.push(id);

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Delete a motor policy
  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM motor_policies WHERE id = $1;';
    await this.pool.query(query, [id]);
  }

  // Search motor policies by vehicle registration number, make, or model
  async search(query: string): Promise<any[]> {
    const searchQuery = `
      SELECT * FROM motor_policies
      WHERE vehicle_registration_number ILIKE $1
      OR make ILIKE $1
      OR model ILIKE $1;
    `;
    const result = await this.pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }

  async findByPolicyIdExcludingId(policyId: number, id: number): Promise<any> {
    const query = `
      SELECT * FROM motor_policies
      WHERE policy_id = $1 AND id != $2;
    `;
    const result = await this.pool.query(query, [policyId, id]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }
}