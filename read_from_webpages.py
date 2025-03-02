import requests
import json
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
import re

# Load environment variables from the .env file
load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
INSURANCE_COMPANIES_URL = "https://www.tira.go.tz/licensed-entities/insurance-companies?page="
INSURANCE_BROKERS_URL = "https://www.tira.go.tz/licensed-entities/insurance-brokers?page="

def standardize_phone_number(phone):
    phone = re.sub(r'[^0-9+]', '', phone)
    if phone.startswith('+255'):
        return phone
    elif phone.startswith('0'):
        return '+255' + phone[1:]
    elif phone.startswith('+'):
        return phone
    return phone

def standardize_address(address):
    api_key = GOOGLE_API_KEY
    url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}'

    response = requests.get(url)
    data = response.json()

    if data['status'] == 'OK':
        standardized_address = data['results'][0]['formatted_address']
        return standardized_address
    else:
        return None

def read_webpage(url):
    """Fetches HTML content of a webpage."""
    print(f'Reading the url: {url}')
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Failed to fetch {url}. Status code: {response.status_code}")
        return None

def extract_company_links(html):
    """Extracts company profile URLs and company names from the main page."""
    soup = BeautifulSoup(html, 'html.parser')
    company_links = []

    for div in soup.find_all("a", href=True, class_="row text-hover-primary cursor-pointerrr hover-bg border-top"):
        # Extract the company URL
        company_url = div["href"]
        
        # Extract the company name (skip the first <span> and get the text inside the <div>)
        company_name_div = div.find("div", class_="col-md-8 col-sm-8 col-6 pl-4 d-flex align-items-center")
        if company_name_div:
            # We want the text without the number from the <span> tag
            company_name = company_name_div.get_text(strip=True).replace(company_name_div.find("span").get_text(strip=True), "").strip()
        else:
            company_name = "Unknown"

        # Append the company name and URL to the list
        company_links.append({"name": company_name, "url": company_url})

    return company_links


def extract_company_details(company_name, company_url):
    """Extracts company details from its profile page."""
    html = read_webpage(company_url)
    if not html:
        return None

    soup = BeautifulSoup(html, 'html.parser')
    details = {}

    for div in soup.find_all("div", class_="col-md-12 last-no-border py-2 border-bottom-faded"):
        label = div.find("div", class_="faded")
        value = div.find("div", class_="text-dark mt-0")

        if label and value:
            key = label.text.strip().lower().replace(" ", "_")
            if 'address' in key:
                standard_address = standardize_address(value.text.strip() + ' Tanzania')
                details[key] = standard_address
            elif 'country' in key:
                details[key] = 'TANZANIA'
            elif 'phone' in key:
                details[key] = standardize_phone_number(value.text.strip())
            else:
                details[key] = value.text.strip()

    details["profile_url"] = company_url
    details["company_name"] = company_name
    return details


def scrape_all_pages(base_url):
    """Scrapes all available pages until an empty page is found."""
    page = 1
    all_data = []

    while True:
        print(f"Scraping page {page}...")
        url = f"{base_url}{page}"
        html = read_webpage(url)
        
        if not html:
            print(f"Stopping at page {page} due to no response.")
            break

        company_small_details = extract_company_links(html)

        if len(company_small_details) == 0:
            print(f"No more data found on page {page}. Stopping.")
            break  # Stop if the current page has no company listings

        for company in company_small_details:
            company_name = company["name"]
            company_url = company["url"]
            details = extract_company_details(company_name, company_url)
            if details:
                all_data.append(details)

        page += 1  # Move to the next page

    return all_data


def save_to_json(data, filename):
    """Saves data into a JSON file."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def main():
    print("Scraping insurance companies...")
    insurance_companies = scrape_all_pages(INSURANCE_COMPANIES_URL)
    save_to_json(insurance_companies, "insurance_companies.json")

    print("Scraping insurance brokers...")
    insurance_brokers = scrape_all_pages(INSURANCE_BROKERS_URL)
    save_to_json(insurance_brokers, "insurance_brokers.json")

    print("Scraping complete. Data saved to JSON files.")


if __name__ == "__main__":
    main()
