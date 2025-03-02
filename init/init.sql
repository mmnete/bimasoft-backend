-- Drop unnecessary tables if they exist, including dependent tables
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
    contact_person_first_name VARCHAR(255) NOT NULL,
    contact_person_last_name VARCHAR(255) NOT NULL,
    contact_person_role VARCHAR(255),
    contact_person_email VARCHAR(255) NOT NULL,
    contact_person_phone VARCHAR(255) NOT NULL,
    admin_username VARCHAR(255) UNIQUE NOT NULL,
    admin_email VARCHAR(255) UNIQUE NOT NULL,
    physical_address VARCHAR(255) NOT NULL,
    insurance_types VARCHAR(255),  -- Stored as a string
    payment_methods VARCHAR(255),    -- Stored as a string
    account_status VARCHAR(50) DEFAULT 'pending'
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
