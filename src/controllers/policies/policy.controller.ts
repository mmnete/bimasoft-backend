import { Request, Response } from 'express';
import { PolicyService } from '../../services/policies/policy.service';

export class PolicyController {
  private policyService: PolicyService;

  constructor() {
    this.policyService = new PolicyService();
  }

  async create(req: Request, res: Response) {
    try {
      const { policyNumber, customerId, insuranceEntityId, entityType, policyType, startDate, endDate, premiumAmount } = req.body;

      // Validate required fields
      if (!policyNumber || !customerId || !insuranceEntityId || !entityType || !policyType || !startDate || !endDate || !premiumAmount) {
        return res.status(400).json({ message: 'Policy number, customer ID, insurance entity ID, entity type, policy type, start date, end date, and premium amount are required' });
      }

      // Check if a policy with the same policy number already exists
      const existingPolicy = await this.policyService.findByPolicyNumber(policyNumber);

      if (existingPolicy) {
        return res.status(400).json({ message: 'A policy with the same policy number already exists' });
      }

      // If no duplicate exists, create the new policy
      const policy = await this.policyService.create(req.body);
      res.status(201).json(policy);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const policies = await this.policyService.findAll();
      res.status(200).json(policies);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const policy = await this.policyService.findOne(Number(req.params.id));
      if (policy) {
        res.status(200).json(policy);
      } else {
        res.status(404).json({ message: 'Policy not found' });
      }
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { policyNumber } = req.body;

      // Validate required fields
      if (!policyNumber) {
        return res.status(400).json({ message: 'Policy number is required' });
      }

      // Check if a policy with the same policy number already exists (excluding the current policy)
      const existingPolicy = await this.policyService.findByPolicyNumberExcludingId(
        policyNumber,
        Number(req.params.id),
      );

      if (existingPolicy) {
        return res.status(400).json({ message: 'A policy with the same policy number already exists' });
      }

      // If no duplicate exists, update the policy
      const policy = await this.policyService.update(Number(req.params.id), req.body);
      res.status(200).json(policy);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.policyService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async search(req: Request, res: Response) {
    try {
      const policies = await this.policyService.search(req.query.query as string);
      res.status(200).json(policies);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findByCustomerId(req: Request, res: Response) {
    try {
      const policies = await this.policyService.findByCustomerId(Number(req.params.customerId));
      res.status(200).json(policies);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findByInsuranceEntity(req: Request, res: Response) {
    try {
      const policies = await this.policyService.findByInsuranceEntity(
        Number(req.params.insuranceEntityId),
        req.params.entityType,
      );
      res.status(200).json(policies);
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