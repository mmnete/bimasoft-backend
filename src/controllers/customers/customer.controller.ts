import { Request, Response } from 'express';
import { CustomerService } from '../../services/customers/customer.service';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async create(req: Request, res: Response) {
    try {
      const { customerType, legalName, tinNumber, nationalId } = req.body;

      // Validate required fields
      if (!customerType || !legalName || !tinNumber) {
        return res.status(400).json({ message: 'Customer type, legal name, and TIN number are required' });
      }

      // For individual customers, validate national ID
      if (customerType === 'individual' && !nationalId) {
        return res.status(400).json({ message: 'National ID is required for individual customers' });
      }

      // Check if a customer with the same legal name, TIN number, or national ID already exists
      const existingCustomer = await this.customerService.findByUniqueFields(
        legalName,
        tinNumber,
        nationalId,
      );

      if (existingCustomer) {
        return res.status(400).json({ message: 'A customer with the same legal name, TIN number, or national ID already exists' });
      }

      // If no duplicate exists, create the new customer
      const customer = await this.customerService.create(req.body);
      res.status(201).json(customer);
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
      const customers = await this.customerService.findAll();
      res.status(200).json(customers);
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
      const customer = await this.customerService.findOne(Number(req.params.id));
      if (customer) {
        res.status(200).json(customer);
      } else {
        res.status(404).json({ message: 'Customer not found' });
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
      const { customerType, legalName, tinNumber, nationalId } = req.body;

      // Validate required fields
      if (!customerType || !legalName || !tinNumber) {
        return res.status(400).json({ message: 'Customer type, legal name, and TIN number are required' });
      }

      // For individual customers, validate national ID
      if (customerType === 'individual' && !nationalId) {
        return res.status(400).json({ message: 'National ID is required for individual customers' });
      }

      // Check if a customer with the same legal name, TIN number, or national ID already exists (excluding the current customer)
      const existingCustomer = await this.customerService.findByUniqueFieldsExcludingId(
        legalName,
        tinNumber,
        nationalId,
        Number(req.params.id),
      );

      if (existingCustomer) {
        return res.status(400).json({ message: 'A customer with the same legal name, TIN number, or national ID already exists' });
      }

      // If no duplicate exists, update the customer
      const customer = await this.customerService.update(Number(req.params.id), req.body);
      res.status(200).json(customer);
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
      await this.customerService.delete(Number(req.params.id));
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
      const customers = await this.customerService.search(req.query.query as string);
      res.status(200).json(customers);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findByTinNumber(req: Request, res: Response) {
    try {
      const customer = await this.customerService.findByTinNumber(req.params.tinNumber);
      if (customer) {
        res.status(200).json(customer);
      } else {
        res.status(404).json({ message: 'Customer not found' });
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