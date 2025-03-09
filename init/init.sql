-- Drop unnecessary tables if they exist, including dependent tables
DROP TABLE IF EXISTS user_organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organization_metadata CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

DROP TABLE IF EXISTS customers CASCADE;

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
    firebase_uid VARCHAR(255) NOT NULL,
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

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    marital_status VARCHAR(255) NOT NULL,
    physical_address VARCHAR(255) NOT NULL,
    national_id VARCHAR(255) NOT NULL,
    drivers_license VARCHAR(255) NOT NULL,
    passport_number VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers_organizations (
    customer_id INT NOT NULL,  -- Foreign key to customers table
    organization_id INT NOT NULL,  -- Foreign key to organizations table
    PRIMARY KEY (customer_id, organization_id),  -- Composite primary key
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
