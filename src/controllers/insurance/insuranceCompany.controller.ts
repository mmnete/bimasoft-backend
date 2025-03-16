import { Request, Response, NextFunction } from 'express';
import { InsuranceCompanyService } from '../../services/companies/insuranceCompanies/insuranceCompany.service';
import { UserService } from '../../services/users/user.service';
import { EntityType } from '../../utils/types';

export class InsuranceCompanyController {
  private insuranceCompanyService: InsuranceCompanyService;
  private userService: UserService;

  constructor() {
    this.insuranceCompanyService = new InsuranceCompanyService();
    this.userService = new UserService();
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { legalName, brelaNumber, tinNumber, adminFullName, adminEmail, adminPhonenumber } = req.body;
  
      // Check if a company with the same legal name, BRELA number, or TIN number already exists
      const existingCompany = await this.insuranceCompanyService.findByUniqueFields(
        legalName,
        brelaNumber,
        tinNumber,
      );
  
      if (existingCompany) {
        res.status(400).json({ message: 'A company with the same legal name, BRELA number, or TIN number already exists' });
        return;
      }
  
      // If no duplicate exists, create the new company
      const company = await this.insuranceCompanyService.create(req.body);
      
      // Create the user for the admin.
      const newAdmin = await this.userService.create({
        fullName: adminFullName,
        email: adminEmail,
        phoneNumber: adminPhonenumber,
        role: 'admin',
        insuranceEntityId: company.id,
        entityType: EntityType.INSURANCE_COMPANY,
        status: 'active'
      });

      res.status(201).json(company);
      return;
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
      return;
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const companies = await this.insuranceCompanyService.findAll();
      res.status(200).json(companies);
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
      const company = await this.insuranceCompanyService.findOne(Number(req.params.id));
      if (company) {
        res.status(200).json(company);
      } else {
        res.status(404).json({ message: 'Company not found' });
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
      const company = await this.insuranceCompanyService.update(Number(req.params.id), req.body);
      res.status(200).json(company);
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
      await this.insuranceCompanyService.delete(Number(req.params.id));
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
      const companies = await this.insuranceCompanyService.search(req.query.query as string);
      res.status(200).json(companies);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async findPendingCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const pendingCompanies = await this.insuranceCompanyService.findByStatus('pending_approval');
      res.status(200).json(pendingCompanies);
    } catch (error) {
      next(error); // Pass the error to Express's error handler
    }
  }
}
