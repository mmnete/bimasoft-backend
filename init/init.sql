-- Drop unnecessary tables if they exist, including dependent tables
DROP TABLE IF EXISTS customers_insurance_entities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS insurance_entity_audit_logs CASCADE;
DROP TABLE IF EXISTS insurance_companies CASCADE;
DROP TABLE IF EXISTS insurance_brokers CASCADE;
DROP TABLE IF EXISTS brokers_companies CASCADE;
DROP TABLE IF EXISTS individual_customers CASCADE;
DROP TABLE IF EXISTS corporate_customers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS motor_policies CASCADE;
DROP TABLE IF EXISTS policies CASCADE;

-- Create the 'insurance_companies' table
CREATE TABLE IF NOT EXISTS insurance_companies (
    id SERIAL PRIMARY KEY,
    legal_name VARCHAR(255) UNIQUE NOT NULL,
    brela_registration_number VARCHAR(255) UNIQUE NOT NULL,  -- BRELA number for Tanzanian companies
    tin_number VARCHAR(255) UNIQUE NOT NULL,  -- Tax Identification Number (TIN)
    tira_license_number VARCHAR(255) UNIQUE,  -- TIRA license for insurance companies
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    physical_address VARCHAR(255) NOT NULL,
    insurance_types VARCHAR(255),  -- Stored as a string (e.g., 'motor, health, life')
    payment_methods VARCHAR(255),  -- Stored as a string (e.g., 'mobile_money, bank_transfer')
    account_status VARCHAR(50) DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended', 'inactive')),
    company_details_url VARCHAR(255),  -- URL to company details or profile
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'insurance_brokers' table
CREATE TABLE IF NOT EXISTS insurance_brokers (
    id SERIAL PRIMARY KEY,
    legal_name VARCHAR(255) UNIQUE NOT NULL,
    brela_registration_number VARCHAR(255) UNIQUE NOT NULL,  -- BRELA number for Tanzanian brokers
    tin_number VARCHAR(255) UNIQUE NOT NULL,  -- Tax Identification Number (TIN)
    tira_license_number VARCHAR(255) UNIQUE,  -- TIRA license for insurance brokers
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    physical_address VARCHAR(255) NOT NULL,
    account_status VARCHAR(50) DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'suspended', 'inactive')),
    company_details_url VARCHAR(255),  -- URL to broker details or profile
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'brokers_companies' table (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS brokers_companies (
    broker_id INT NOT NULL,  -- Foreign key to insurance_brokers table
    company_id INT NOT NULL,  -- Foreign key to insurance_companies table
    PRIMARY KEY (broker_id, company_id),  -- Composite primary key
    FOREIGN KEY (broker_id) REFERENCES insurance_brokers(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES insurance_companies(id) ON DELETE CASCADE
);

-- Users Table (for admins, brokers, and company agents)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) NOT NULL,  -- Firebase authentication ID
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) CHECK (role IN ('admin', 'broker_agent', 'company_agent')) NOT NULL,
    insurance_entity_id INT NOT NULL,  -- Foreign key to insurance_companies or insurance_brokers table
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('insurance_company', 'insurance_broker')),  -- Indicates which table to reference
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'insurance_entity_audit_logs' table
CREATE TABLE IF NOT EXISTS insurance_entity_audit_logs (
    id SERIAL PRIMARY KEY,
    insurance_entity_id INT NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('insurance_company', 'insurance_broker')),  -- Indicates which table to reference
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('created', 'edited')),
    modified_by VARCHAR(255) NOT NULL,  -- User who made the change
    ip_address VARCHAR(50),  -- User's IP address
    device_type VARCHAR(50),  -- 'Mobile', 'Desktop', 'Tablet', etc.
    operating_system VARCHAR(100),  -- 'Windows 10', 'MacOS', 'Linux', 'Android'
    browser VARCHAR(100),  -- 'Chrome', 'Firefox', 'Edge'
    geolocation VARCHAR(255),  -- Country/City based on IP
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base Customers Table (common fields for all customers)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_type VARCHAR(50) NOT NULL CHECK (customer_type IN ('individual', 'corporate')),
    legal_name VARCHAR(255) NOT NULL,  -- Full name for individuals, legal name for organizations
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    physical_address VARCHAR(255),
    tin_number VARCHAR(255),  -- Tax Identification Number (TIN)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual Customers Table (specific fields for individuals)
CREATE TABLE IF NOT EXISTS individual_customers (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL UNIQUE,  -- Foreign key to customers table
    national_id VARCHAR(255) NOT NULL,  -- NIDA number for Tanzanian citizens
    drivers_license VARCHAR(255),
    passport_number VARCHAR(255),
    gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'other')),
    marital_status VARCHAR(50) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Corporate Customers Table (specific fields for organizations)
CREATE TABLE IF NOT EXISTS corporate_customers (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL UNIQUE,  -- Foreign key to customers table
    brela_registration_number VARCHAR(255) NOT NULL,  -- BRELA number for Tanzanian companies
    company_details_url VARCHAR(255),  -- URL to company details or profile
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Customers_Insurance_Entities Table (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS customers_insurance_entities (
    customer_id INT NOT NULL,  -- Foreign key to customers table
    insurance_entity_id INT NOT NULL,  -- Foreign key to insurance_companies or insurance_brokers table
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('insurance_company', 'insurance_broker')),  -- Indicates which table to reference
    PRIMARY KEY (customer_id, insurance_entity_id, entity_type),  -- Composite primary key
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Base Policies Table (common fields for all policies)
CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    policy_number VARCHAR(255) UNIQUE NOT NULL,
    customer_id INT NOT NULL,  -- Foreign key to customers table
    insurance_entity_id INT NOT NULL,  -- Foreign key to insurance_companies or insurance_brokers table
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('insurance_company', 'insurance_broker')),  -- Indicates which table to reference
    policy_type VARCHAR(50) NOT NULL,  -- e.g., 'motor', 'health', 'life'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Motor Policies Table (specific fields for motor insurance)
CREATE TABLE IF NOT EXISTS motor_policies (
    id SERIAL PRIMARY KEY,
    policy_id INT NOT NULL UNIQUE,  -- Foreign key to policies table
    vehicle_registration_number VARCHAR(255) NOT NULL,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year_of_manufacture INT NOT NULL,
    chassis_number VARCHAR(255) NOT NULL,
    engine_number VARCHAR(255) NOT NULL,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE
);
