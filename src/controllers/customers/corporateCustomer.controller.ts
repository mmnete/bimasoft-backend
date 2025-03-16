import { Request, Response } from 'express';
import { CorporateCustomerService } from '../../services/customers/corporateCustomers/corporateCustomer.service';

export class CorporateCustomerController {
  private corporateCustomerService: CorporateCustomerService;

  constructor() {
    this.corporateCustomerService = new CorporateCustomerService();
  }

  async create(req: Request, res: Response) {
    try {
      const { customerId, brelaRegistrationNumber, companyDetailsUrl } = req.body;

      // Validate required fields
      if (!customerId || !brelaRegistrationNumber) {
        return res.status(400).json({ message: 'Customer ID and BRELA registration number are required' });
      }

      // Check if a corporate customer with the same BRELA registration number already exists
      const existingCorporateCustomer = await this.corporateCustomerService.findByBrelaRegistrationNumber(brelaRegistrationNumber);

      if (existingCorporateCustomer) {
        return res.status(400).json({ message: 'A corporate customer with the same BRELA registration number already exists' });
      }

      // If no duplicate exists, create the new corporate customer
      const corporateCustomer = await this.corporateCustomerService.create(req.body);
      res.status(201).json(corporateCustomer);
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
      const corporateCustomers = await this.corporateCustomerService.findAll();
      res.status(200).json(corporateCustomers);
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
      const corporateCustomer = await this.corporateCustomerService.findOne(Number(req.params.id));
      if (corporateCustomer) {
        res.status(200).json(corporateCustomer);
      } else {
        res.status(404).json({ message: 'Corporate customer not found' });
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
      const { brelaRegistrationNumber } = req.body;

      // Validate required fields
      if (!brelaRegistrationNumber) {
        return res.status(400).json({ message: 'BRELA registration number is required' });
      }

      // Check if a corporate customer with the same BRELA registration number already exists (excluding the current corporate customer)
      const existingCorporateCustomer = await this.corporateCustomerService.findByBrelaRegistrationNumberExcludingId(
        brelaRegistrationNumber,
        Number(req.params.id),
      );

      if (existingCorporateCustomer) {
        return res.status(400).json({ message: 'A corporate customer with the same BRELA registration number already exists' });
      }

      // If no duplicate exists, update the corporate customer
      const corporateCustomer = await this.corporateCustomerService.update(Number(req.params.id), req.body);
      res.status(200).json(corporateCustomer);
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
      await this.corporateCustomerService.delete(Number(req.params.id));
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

  async findByBrelaRegistrationNumber(req: Request, res: Response) {
    try {
      const corporateCustomer = await this.corporateCustomerService.findByBrelaRegistrationNumber(req.params.brelaRegistrationNumber);
      if (corporateCustomer) {
        res.status(200).json(corporateCustomer);
      } else {
        res.status(404).json({ message: 'Corporate customer not found' });
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