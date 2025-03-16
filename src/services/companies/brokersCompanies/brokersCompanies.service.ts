import { Pool } from 'pg';
import pool from '../../../config/db';

export class BrokersCompaniesService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Add a broker to a company
  async addBrokerToCompany(brokerId: number, companyId: number): Promise<any> {
    const query = `
      INSERT INTO brokers_companies (broker_id, company_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await this.pool.query(query, [brokerId, companyId]);
    return result.rows[0];
  }

  // Remove a broker from a company
  async removeBrokerFromCompany(brokerId: number, companyId: number): Promise<void> {
    const query = `
      DELETE FROM brokers_companies
      WHERE broker_id = $1 AND company_id = $2;
    `;
    await this.pool.query(query, [brokerId, companyId]);
  }

  // Find all companies for a broker
  async findCompaniesByBroker(brokerId: number): Promise<any[]> {
    const query = `
      SELECT ic.* FROM insurance_companies ic
      JOIN brokers_companies bc ON ic.id = bc.company_id
      WHERE bc.broker_id = $1;
    `;
    const result = await this.pool.query(query, [brokerId]);
    return result.rows;
  }

  async findRelation(brokerId: number, companyId: number): Promise<any> {
    const query = `
      SELECT * FROM brokers_companies
      WHERE broker_id = $1 AND company_id = $2;
    `;
    const result = await this.pool.query(query, [brokerId, companyId]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }

  // Find all brokers for a company
  async findBrokersByCompany(companyId: number): Promise<any[]> {
    const query = `
      SELECT ib.* FROM insurance_brokers ib
      JOIN brokers_companies bc ON ib.id = bc.broker_id
      WHERE bc.company_id = $1;
    `;
    const result = await this.pool.query(query, [companyId]);
    return result.rows;
  }
}