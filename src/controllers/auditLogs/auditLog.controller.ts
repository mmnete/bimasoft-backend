import { Request, Response } from 'express';
import { AuditLogService } from '../../services/auditLogs/auditLog.service';

export class AuditLogController {
  private auditLogService: AuditLogService;

  constructor() {
    this.auditLogService = new AuditLogService();
  }

  async create(req: Request, res: Response) {
    try {
      const { insuranceEntityId, entityType, actionType, modifiedBy } = req.body;

      // Validate required fields
      if (!insuranceEntityId || !entityType || !actionType || !modifiedBy) {
        return res.status(400).json({ message: 'Insurance entity ID, entity type, action type, and modified by are required' });
      }

      // Validate entity type
      const validEntityTypes = ['insurance_company', 'insurance_broker'];
      if (!validEntityTypes.includes(entityType)) {
        return res.status(400).json({ message: 'Invalid entity type. Must be one of: insurance_company, insurance_broker' });
      }

      // If validations pass, create the audit log
      const log = await this.auditLogService.create(req.body);
      res.status(201).json(log);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findByEntity(req: Request, res: Response) {
    try {
      const entityId = Number(req.params.entityId);
      const entityType = req.params.entityType;

      // Validate entity type
      const validEntityTypes = ['insurance_company', 'insurance_broker'];
      if (!validEntityTypes.includes(entityType)) {
        return res.status(400).json({ message: 'Invalid entity type. Must be one of: insurance_company, insurance_broker' });
      }

      // If validations pass, fetch the audit logs
      const logs = await this.auditLogService.findByEntity(entityId, entityType);
      res.status(200).json(logs);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }
}