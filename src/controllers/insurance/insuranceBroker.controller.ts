import { Request, Response, NextFunction } from 'express';
import { InsuranceBrokerService } from '../../services/companies/insuranceBrokers/insuranceBroker.service';
import { UserService } from '../../services/users/user.service';
import { EntityType } from '../../utils/types';

export class InsuranceBrokerController {
    private insuranceBrokerService: InsuranceBrokerService;
    private userService: UserService;

    constructor() {
        this.insuranceBrokerService = new InsuranceBrokerService();
        this.userService = new UserService();
    }

    async create(req: Request, res: Response) {
        try {
            const {
                legalName,
                brelaNumber,
                tinNumber,
                contactEmail,
                contactPhone,
                adminFullName,
                adminEmail,
                adminPhonenumber,
                companyIds, // List of company IDs the broker works with
            } = req.body;

            // Validate required fields
            if (!legalName || !brelaNumber || !tinNumber) {
                res.status(400).json({ message: 'Legal name, BRELA number, and TIN number are required' });
                return;
            }

            // Validate email format (basic check)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (contactEmail && !emailRegex.test(contactEmail)) {
                res.status(400).json({ message: 'Invalid email format' });
                return;
            }

            // Validate phone number format (basic check)
            const phoneRegex = /^\+?\d{10,15}$/;
            if (contactPhone && !phoneRegex.test(contactPhone)) {
                res.status(400).json({ message: 'Invalid phone number format' });
                return;
            }

            // Check if a broker with the same legal name, BRELA number, or TIN number already exists
            const existingBroker = await this.insuranceBrokerService.findByUniqueFields(
                legalName,
                brelaNumber,
                tinNumber,
            );

            if (existingBroker) {
                res.status(400).json({ message: 'A broker with the same legal name, BRELA number, or TIN number already exists' });
                return;
            }

            // If no duplicate exists, create the new broker
            const broker = await this.insuranceBrokerService.create(req.body);

            // Associate the broker with the specified companies
            if (companyIds && companyIds.length > 0) {
                await this.insuranceBrokerService.associateWithCompanies(broker.id, companyIds);
            }

            // Create the user for the admin.
            const newAdmin = await this.userService.create({
                fullName: adminFullName,
                email: adminEmail,
                phoneNumber: adminPhonenumber,
                role: 'admin',
                insuranceEntityId: broker.id,
                entityType: EntityType.INSURANCE_BROKER,
                status: 'active'
            });

            res.status(201).json(broker);
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
            const brokers = await this.insuranceBrokerService.findAll();
            res.status(200).json(brokers);
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
            const broker = await this.insuranceBrokerService.findOne(Number(req.params.id));
            if (broker) {
                res.status(200).json(broker);
            } else {
                res.status(404).json({ message: 'Broker not found' });
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
            const broker = await this.insuranceBrokerService.update(Number(req.params.id), req.body);
            res.status(200).json(broker);
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
            await this.insuranceBrokerService.delete(Number(req.params.id));
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
            const brokers = await this.insuranceBrokerService.search(req.query.query as string);
            res.status(200).json(brokers);
        } catch (error) {
            // Safely handle the error
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    }

    async findPendingBrokers(req: Request, res: Response, next: NextFunction) {
        try {
          const pendingCompanies = await this.insuranceBrokerService.findByStatus('pending_approval');
          res.status(200).json(pendingCompanies);
        } catch (error) {
          next(error); // Pass the error to Express's error handler
        }
      }
}