import { Pool } from 'pg';
import pool from '../../../config/db';
import { InsuranceCompanyData, AccountStatus } from '../../../utils/types';

export class InsuranceCompanyService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Create a new insurance company
  async create(insuranceCompanyData: InsuranceCompanyData): Promise<any> {
    const query = `
      INSERT INTO insurance_companies (
        legal_name, brela_registration_number, tin_number, tira_license_number,
        contact_email, contact_phone, physical_address, insurance_types,
        payment_methods, account_status, company_details_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
  
    // Convert arrays to JSON strings
    const insuranceTypesJson = insuranceCompanyData.insuranceTypes
      ? JSON.stringify(insuranceCompanyData.insuranceTypes)
      : '';
    const paymentMethodsJson = insuranceCompanyData.paymentMethods
      ? JSON.stringify(insuranceCompanyData.paymentMethods)
      : '';
  
    const values = [
      insuranceCompanyData.legalName,
      insuranceCompanyData.brelaRegistrationNumber,
      insuranceCompanyData.tinNumber,
      insuranceCompanyData.tiraLicenseNumber,
      insuranceCompanyData.contactEmail,
      insuranceCompanyData.contactPhone,
      insuranceCompanyData.physicalAddress,
      insuranceTypesJson, // Use the JSON string
      paymentMethodsJson, // Use the JSON string
      insuranceCompanyData.accountStatus || 'pending_approval', // Default to 'pending' if not provided
      insuranceCompanyData.companyDetailsUrl,
    ];
  
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Find all insurance companies
  async findAll(): Promise<any[]> {
    const query = 'SELECT * FROM insurance_companies;';
    const result = await this.pool.query(query);
    return result.rows;
  }

  // Find one insurance company by ID
  async findOne(id: number): Promise<any> {
    const query = 'SELECT * FROM insurance_companies WHERE id = $1;';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async findByUniqueFields(legalName: string, brelaNumber: string, tinNumber: string): Promise<any> {
    const query = `
      SELECT * FROM insurance_companies
      WHERE legal_name = $1 OR brela_registration_number = $2 OR tin_number = $3;
    `;
    const result = await this.pool.query(query, [legalName, brelaNumber, tinNumber]);
    return result.rows[0] || null; // Return the first match or null if no match is found
  }

  // Update an insurance company
  async update(id: number, updateData: Partial<{
    legalName: string;
    brelaRegistrationNumber: string;
    tinNumber: string;
    tiraLicenseNumber?: string;
    contactEmail: string;
    contactPhone: string;
    physicalAddress: string;
    insuranceTypes?: string;
    paymentMethods?: string;
    accountStatus?: string;
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
      UPDATE insurance_companies
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    values.push(id);

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Delete an insurance company
  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM insurance_companies WHERE id = $1;';
    await this.pool.query(query, [id]);
  }

  // Search insurance companies by name or TIN
  async search(query: string): Promise<any[]> {
    const searchQuery = `
      SELECT * FROM insurance_companies
      WHERE legal_name ILIKE $1 OR tin_number ILIKE $1;
    `;
    const result = await this.pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }

  async findByStatus(status: AccountStatus): Promise<any[]> {
    const query = 'SELECT * FROM insurance_companies WHERE account_status = $1;';
    const result = await this.pool.query(query, [status]);
    return result.rows;
  }
}
