import brokersData from '../../data/insurance_brokers.json';
import companiesData from '../../data/insurance_companies.json';
import { InsuranceEntity } from '../../utils/types';
import { Request, Response } from 'express';

// Helper function to read and search for companies from imported data
function readAndSearchCompanies(companies: any[], queryName: string, type: string): InsuranceEntity[] {
    if (queryName.toLowerCase().length < 2) {
        return [];
    }

    // Filter companies based on the query name (case insensitive)
    const matchingCompanies = companies.filter(company => {
        // Prepare query to lowercase for case-insensitive matching
        const queryLower = queryName.toLowerCase();
        const companyNameLower = company.company_name.toLowerCase();
    
        // Check if the query matches the company name with handling for prefixes and suffixes
        return companyNameLower.startsWith(queryLower) || companyNameLower.endsWith(queryLower) || companyNameLower.includes(queryLower);
    }).map(company => {
        var address = company.address;

        var newEntity = {
            legalName: company.company_name,
            brelaNumber: '',
            tinNumber: '',
            contactEmail: company.email,
            contactPhone: company.phone_number,
            tiraLicense: company.number_of_license,
            insuranceTypes: [],
            paymentMethods: [],
            adminFullname: '',
            adminEmail: company.email,
            country: company.country,
            city: company.country,
            poBox: '',
            floorBuilding: '',
            street: '',
            companyDetailsUrl: company.profile_url
        };

        return newEntity;
    });

    // Add the type to the companies for distinguishing between brokers and companies
    return matchingCompanies.map(company => ({
        ...company,
        type: type,  // Add type to the result
    }));
}

// API to search companies based on query
export const searchCompanyFromWeb = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = req.query.query as string;  // Get search query from request

        if (!query) {
            res.status(400).json({
                success: false,
                message: "Search query is required",
            });
            return;
        }

        // Search in both companies and brokers data
        const insuranceCompanies = readAndSearchCompanies(companiesData, query, 'insurance_company');

        // Combine the results from both
        const filteredCompanies = [...insuranceCompanies];

        res.status(200).json({
            success: true,
            data: filteredCompanies,
        });
    } catch (error) {
        console.error('Error in searchCompany:', error);
        res.status(500).json({
            success: false,
            message: "Error searching for companies",
        });
    }
};

export const searchBrokerFromWeb = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = req.query.query as string;  // Get search query from request

        if (!query) {
            res.status(400).json({
                success: false,
                message: "Search query is required",
            });
            return;
        }

        // Search in both companies and brokers data
        const brokerCompanies = readAndSearchCompanies(brokersData, query, 'insurance_broker');

        // Combine the results from both
        const filteredCompanies = [...brokerCompanies];

        res.status(200).json({
            success: true,
            data: filteredCompanies,
        });
    } catch (error) {
        console.error('Error in searchCompany:', error);
        res.status(500).json({
            success: false,
            message: "Error searching for companies",
        });
    }
};

