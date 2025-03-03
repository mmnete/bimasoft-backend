-- Drop unnecessary tables if they exist, including dependent tables
DROP TABLE IF EXISTS user_organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organization_metadata CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Create the simplified 'organizations' table
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    organization_type VARCHAR(50) NOT NULL,
    legal_name VARCHAR(255) UNIQUE NOT NULL,
    brela_number VARCHAR(255) UNIQUE NOT NULL,
    tin_number VARCHAR(255) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    tira_license VARCHAR(255),
    physical_address VARCHAR(255) NOT NULL,
    insurance_types VARCHAR(255),  -- Stored as a string
    payment_methods VARCHAR(255),  -- Stored as a string
    account_status VARCHAR(50) DEFAULT 'pending',
    company_details_url VARCHAR(255)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) CHECK (role IN ('admin', 'broker_agent', 'company_agent')) NOT NULL,
    organization_id INT NOT NULL,  -- Foreign key reference to the organizations table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Users Organizations (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS user_organizations (
    user_id INT NOT NULL,
    organization_id INT NOT NULL,
    PRIMARY KEY (user_id, organization_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create the 'organization_metadata' table with more details
CREATE TABLE IF NOT EXISTS organization_metadata (
    id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'created' or 'edited'
    modified_by VARCHAR(255) NOT NULL, -- Admin who made the change
    ip_address VARCHAR(50), -- User's IP address
    device_type VARCHAR(50), -- 'Mobile', 'Desktop', 'Tablet', etc.
    operating_system VARCHAR(100), -- 'Windows 10', 'MacOS', 'Linux', 'Android'
    browser VARCHAR(100), -- 'Chrome', 'Firefox', 'Edge'
    geolocation VARCHAR(255), -- Country/City based on IP
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Insert 30 random companies into the organizations table
INSERT INTO organizations (
    organization_type,
    legal_name,
    brela_number,
    tin_number,
    contact_email,
    contact_phone,
    tira_license,
    physical_address,
    insurance_types,
    payment_methods,
    account_status,
    company_details_url
)
SELECT
    'Corporation' AS organization_type,
    'Company ' || i AS legal_name,
    'BRELA-' || i AS brela_number,
    'TIN-' || i AS tin_number,
    'contact@company' || i || '.com' AS contact_email,
    '123-456-' || LPAD(i::text, 4, '0') AS contact_phone,
    'TIRA-' || i AS tira_license,
    '123 Main St, City ' || i AS physical_address,
    'Health, Property, Life' AS insurance_types,
    'Credit Card, Bank Transfer' AS payment_methods,
    'pending' AS account_status,
    'http://company' || i || '.com' AS company_details_url
FROM generate_series(1, 30) AS s(i);

