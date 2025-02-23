-- Drop unnecessary tables if they exist
DROP TABLE IF EXISTS organization_insurance_types;
DROP TABLE IF EXISTS insurance_types;
DROP TABLE IF EXISTS organization_payment_methods;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS contact_persons;
DROP TABLE IF EXISTS organizations;

-- Create the simplified 'organizations' table
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
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
    insurance_types VARCHAR(255),  -- Stored as a string
    payment_methods VARCHAR(255),    -- Stored as a string
    account_status VARCHAR(50) DEFAULT 'pending'
);
