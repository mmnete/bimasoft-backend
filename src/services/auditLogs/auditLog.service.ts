import { Pool } from 'pg';
import pool from '../../config/db';

export class AuditLogService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  // Create a new audit log entry
  async create(auditLogData: {
    insuranceEntityId: number;
    entityType: string;
    actionType: string;
    modifiedBy: string;
    ipAddress?: string;
    deviceType?: string;
    operatingSystem?: string;
    browser?: string;
    geolocation?: string;
  }): Promise<any> {
    const query = `
      INSERT INTO insurance_entity_audit_logs (
        insurance_entity_id, entity_type, action_type, modified_by,
        ip_address, device_type, operating_system, browser, geolocation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      auditLogData.insuranceEntityId,
      auditLogData.entityType,
      auditLogData.actionType,
      auditLogData.modifiedBy,
      auditLogData.ipAddress,
      auditLogData.deviceType,
      auditLogData.operatingSystem,
      auditLogData.browser,
      auditLogData.geolocation,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  // Find all audit logs for a specific entity
  async findByEntity(entityId: number, entityType: string): Promise<any[]> {
    const query = `
      SELECT * FROM insurance_entity_audit_logs
      WHERE insurance_entity_id = $1 AND entity_type = $2;
    `;
    const result = await this.pool.query(query, [entityId, entityType]);
    return result.rows;
  }
}