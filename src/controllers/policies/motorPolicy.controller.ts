import { Request, Response } from 'express';
import { MotorPolicyService } from '../../services/policies/motorPolicies/motorPolicy.service';

export class MotorPolicyController {
  private motorPolicyService: MotorPolicyService;

  constructor() {
    this.motorPolicyService = new MotorPolicyService();
  }

  async create(req: Request, res: Response) {
    try {
      const { policyId, vehicleRegistrationNumber, make, model, yearOfManufacture, chassisNumber, engineNumber } = req.body;

      // Validate required fields
      if (!policyId || !vehicleRegistrationNumber || !make || !model || !yearOfManufacture || !chassisNumber || !engineNumber) {
        return res.status(400).json({ message: 'Policy ID, vehicle registration number, make, model, year of manufacture, chassis number, and engine number are required' });
      }

      // Check if a motor policy with the same policy ID already exists
      const existingMotorPolicy = await this.motorPolicyService.findByPolicyId(policyId);

      if (existingMotorPolicy) {
        return res.status(400).json({ message: 'A motor policy with the same policy ID already exists' });
      }

      // If no duplicate exists, create the new motor policy
      const motorPolicy = await this.motorPolicyService.create(req.body);
      res.status(201).json(motorPolicy);
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
      const motorPolicies = await this.motorPolicyService.findAll();
      res.status(200).json(motorPolicies);
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
      const motorPolicy = await this.motorPolicyService.findOne(Number(req.params.id));
      if (motorPolicy) {
        res.status(200).json(motorPolicy);
      } else {
        res.status(404).json({ message: 'Motor policy not found' });
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
      const { policyId, vehicleRegistrationNumber, make, model, yearOfManufacture, chassisNumber, engineNumber } = req.body;

      // Validate required fields
      if (!policyId || !vehicleRegistrationNumber || !make || !model || !yearOfManufacture || !chassisNumber || !engineNumber) {
        return res.status(400).json({ message: 'Policy ID, vehicle registration number, make, model, year of manufacture, chassis number, and engine number are required' });
      }

      // Check if a motor policy with the same policy ID already exists (excluding the current motor policy)
      const existingMotorPolicy = await this.motorPolicyService.findByPolicyIdExcludingId(
        policyId,
        Number(req.params.id),
      );

      if (existingMotorPolicy) {
        return res.status(400).json({ message: 'A motor policy with the same policy ID already exists' });
      }

      // If no duplicate exists, update the motor policy
      const motorPolicy = await this.motorPolicyService.update(Number(req.params.id), req.body);
      res.status(200).json(motorPolicy);
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
      await this.motorPolicyService.delete(Number(req.params.id));
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

  async findByPolicyId(req: Request, res: Response) {
    try {
      const motorPolicy = await this.motorPolicyService.findByPolicyId(Number(req.params.policyId));
      if (motorPolicy) {
        res.status(200).json(motorPolicy);
      } else {
        res.status(404).json({ message: 'Motor policy not found' });
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
}