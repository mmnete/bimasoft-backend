import brokersData from '../data/insurance_brokers.json';
import companiesData from '../data/insurance_companies.json';
import { Request, Response } from 'express';

interface Company {
    company_name: string; // company name (assuming this is the field you're filtering by)
    date_of_license: string;
    number_of_license: string;
    status: string;
    country: string;
    phone: string;
    email: string;
    address: string | null;
    profile_url: string;
    type?: string; // Optional type for distinguishing brokers vs companies
    date_of_application?: string; // Optional field, if it exists in some data
    class_of_business?: string; // Optional field, if it exists in some data
}

// Helper function to read and search for companies from imported data
function readAndSearchCompanies(companies: any[], queryName: string, type: string): Company[] {
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
    });

    // Add the type to the companies for distinguishing between brokers and companies
    return matchingCompanies.map(company => ({
        ...company,
        type: type,  // Add type to the result
    }));
}

// API to search companies based on query
export const searchCompany = async (req: Request, res: Response): Promise<void> => {
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
        const insuranceCompanies = readAndSearchCompanies(companiesData, query, 'insurance_company');

        // Combine the results from both
        const filteredCompanies = [...brokerCompanies, ...insuranceCompanies];

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
