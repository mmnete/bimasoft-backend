import { Request, Response } from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';

// Define the company type
interface Company {
    name: string;
    link: string;
    details?: string;
}

const scrapePage = async (page: number): Promise<Company[]> => {
    const url = `https://www.tira.go.tz/licensed-entities/insurance-companies?page=${page}`;  // Actual URL

    try {
        // Fetch the HTML content of the page
        const { data } = await axios.get(url);

        // Initialize jsdom with the HTML content
        const dom = new JSDOM(data);
        const document = dom.window.document;

        // Parse the company details from the page
        const companies: Company[] = [];

        // Adjust the selector based on the provided HTML structure
        const companyElements = document.querySelectorAll('div.searchable-record');

        // Assuming companyElements is a NodeListOf<Element> (as returned by querySelectorAll) and companies is an array of { name: string, link: string } objects
        companyElements.forEach((element: Element) => {
            const name: string = element.getAttribute('data-name')?.trim() ?? '';  // Get the name from the data-name attribute
            const link: string = element.querySelector('a')?.getAttribute('href') ?? '';  // Get the link from the <a> tag

            if (name && link) {
                companies.push({ name, link });
            }
        });

        return companies;
    } catch (error) {
        console.error('Error scraping page', error);
        return [];
    }
};


// Function to scrape additional details from a company's detail page
const scrapeCompanyDetails = async (companyUrl: string): Promise<any> => {
    try {
        const { data } = await axios.get(companyUrl);

        // Initialize jsdom with the HTML content
        const dom = new JSDOM(data);
        const document = dom.window.document;

        // Define an object to store the company details
        const details: any = {};

        // Query each row of company details
        const rows = document.querySelectorAll('div.row');

        rows.forEach((row: Element) => {
            const label = row.querySelector('div.faded')?.textContent?.trim().toLowerCase();
            const value = row.querySelector('div.text-dark')?.textContent?.trim();

            // Store the label-value pairs in the details object
            if (label && value) {
                details[label] = value;
            }
        });

        // Return the details object
        return details;
    } catch (error) {
        console.error('Error scraping company details', error);
        return null;
    }
};


// Function to scrape multiple pages
const scrapeAllPages = async (totalPages: number): Promise<Company[]> => {
    const allCompanies: Company[] = [];

    // Loop through pages 1 to totalPages
    for (let i = 1; i <= totalPages; i++) {
        const companies = await scrapePage(i);
        allCompanies.push(...companies);
    }

    return allCompanies;
};

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

        // Scrape companies from the first page (you can change this to scrape more if needed)
        const companies = await scrapeAllPages(5);  // Scrape 5 pages for example

        // Filter companies based on the query
        const filteredCompanies = companies.filter(company =>
            company.name.toLowerCase().includes(query.toLowerCase())
        );

        // Optionally, scrape additional details from the company's detail page
        for (let company of filteredCompanies) {
            const details = await scrapeCompanyDetails(company.link);
            if (details) {
                company.details = details;  // Add the details to the company object
            }
        }

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
