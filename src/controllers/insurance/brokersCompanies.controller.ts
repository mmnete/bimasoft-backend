import { Request, Response } from 'express';
import { BrokersCompaniesService } from '../../services/companies/brokersCompanies/brokersCompanies.service';
import { InsuranceBrokerService } from '../../services/companies/insuranceBrokers/insuranceBroker.service';
import { InsuranceCompanyService } from '../../services/companies/insuranceCompanies/insuranceCompany.service';

export class BrokersCompaniesController {
  private brokersCompaniesService: BrokersCompaniesService;
  private insuranceBrokerService: InsuranceBrokerService;
  private insuranceCompanyService: InsuranceCompanyService;

  constructor() {
    this.brokersCompaniesService = new BrokersCompaniesService();
    this.insuranceBrokerService = new InsuranceBrokerService();
    this.insuranceCompanyService = new InsuranceCompanyService();
  }

  async addBrokerToCompany(req: Request, res: Response) {
    try {
      const brokerId = Number(req.params.brokerId);
      const companyId = Number(req.params.companyId);

      // Check if the broker exists
      const broker = await this.insuranceBrokerService.findOne(brokerId);
      if (!broker) {
        return res.status(404).json({ message: 'Broker not found' });
      }

      // Check if the company exists
      const company = await this.insuranceCompanyService.findOne(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Check if the relationship already exists
      const existingRelation = await this.brokersCompaniesService.findRelation(
        brokerId,
        companyId,
      );
      if (existingRelation) {
        return res.status(400).json({ message: 'The broker is already associated with this company' });
      }

      // If no duplicate exists, create the relationship
      const relation = await this.brokersCompaniesService.addBrokerToCompany(brokerId, companyId);
      res.status(201).json(relation);
    } catch (error) {
      // Safely handle the error
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  async removeBrokerFromCompany(req: Request, res: Response) {
    try {
      const brokerId = Number(req.params.brokerId);
      const companyId = Number(req.params.companyId);

      // Check if the broker exists
      const broker = await this.insuranceBrokerService.findOne(brokerId);
      if (!broker) {
        return res.status(404).json({ message: 'Broker not found' });
      }

      // Check if the company exists
      const company = await this.insuranceCompanyService.findOne(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Check if the relationship exists
      const existingRelation = await this.brokersCompaniesService.findRelation(
        brokerId,
        companyId,
      );
      if (!existingRelation) {
        return res.status(404).json({ message: 'The broker is not associated with this company' });
      }

      // If the relationship exists, remove it
      await this.brokersCompaniesService.removeBrokerFromCompany(brokerId, companyId);
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

  async findCompaniesByBroker(req: Request, res: Response) {
    try {
      const brokerId = Number(req.params.brokerId);

      // Check if the broker exists
      const broker = await this.insuranceBrokerService.findOne(brokerId);
      if (!broker) {
        return res.status(404).json({ message: 'Broker not found' });
      }

      // Find companies associated with the broker
      const companies = await this.brokersCompaniesService.findCompaniesByBroker(brokerId);
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

  async findBrokersByCompany(req: Request, res: Response) {
    try {
      const companyId = Number(req.params.companyId);

      // Check if the company exists
      const company = await this.insuranceCompanyService.findOne(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Find brokers associated with the company
      const brokers = await this.brokersCompaniesService.findBrokersByCompany(companyId);
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
}