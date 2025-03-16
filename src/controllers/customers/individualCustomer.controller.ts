import { Request, Response } from 'express';
import { IndividualCustomerService } from '../../services/customers/individualCustomers/individualCustomer.service';

export class IndividualCustomerController {
  private individualCustomerService: IndividualCustomerService;

  constructor() {
    this.individualCustomerService = new IndividualCustomerService();
  }

  // Create a new individual customer
  async create(req: Request, res: Response) {
    try {
      const { customerId, nationalId, driversLicense, passportNumber, gender, maritalStatus } = req.body;

      // Validate required fields
      if (!customerId || !nationalId) {
        return res.status(400).json({ message: 'Customer ID and national ID are required' });
      }

      // Check if an individual customer with the same national ID already exists
      const existingIndividualCustomer = await this.individualCustomerService.findByNationalId(nationalId);

      if (existingIndividualCustomer) {
        return res.status(400).json({ message: 'An individual customer with the same national ID already exists' });
      }

      // If no duplicate exists, create the new individual customer
      const individualCustomer = await this.individualCustomerService.create(req.body);
      res.status(201).json(individualCustomer);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  // Find all individual customers
  async findAll(req: Request, res: Response) {
    try {
      const individualCustomers = await this.individualCustomerService.findAll();
      res.status(200).json(individualCustomers);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  // Find one individual customer by ID
  async findOne(req: Request, res: Response) {
    try {
      const individualCustomer = await this.individualCustomerService.findOne(Number(req.params.id));
      if (individualCustomer) {
        res.status(200).json(individualCustomer);
      } else {
        res.status(404).json({ message: 'Individual customer not found' });
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

  // Update an individual customer
  async update(req: Request, res: Response) {
    try {
      const { nationalId } = req.body;

      // Validate required fields
      if (!nationalId) {
        return res.status(400).json({ message: 'National ID is required' });
      }

      // Check if an individual customer with the same national ID already exists (excluding the current individual customer)
      const existingIndividualCustomer = await this.individualCustomerService.findByNationalIdExcludingId(
        nationalId,
        Number(req.params.id),
      );

      if (existingIndividualCustomer) {
        return res.status(400).json({ message: 'An individual customer with the same national ID already exists' });
      }

      // If no duplicate exists, update the individual customer
      const individualCustomer = await this.individualCustomerService.update(Number(req.params.id), req.body);
      res.status(200).json(individualCustomer);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  // Delete an individual customer
  async delete(req: Request, res: Response) {
    try {
      await this.individualCustomerService.delete(Number(req.params.id));
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

  // Find an individual customer by national ID
  async findByNationalId(req: Request, res: Response) {
    try {
      const individualCustomer = await this.individualCustomerService.findByNationalId(req.params.nationalId);
      if (individualCustomer) {
        res.status(200).json(individualCustomer);
      } else {
        res.status(404).json({ message: 'Individual customer not found' });
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