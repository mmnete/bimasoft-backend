-- init.sql
-- Create the 'organizations' table only if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    brela_number VARCHAR(255) UNIQUE NOT NULL,
    tin_number VARCHAR(255) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    tira_license VARCHAR(255)
);

-- Create the 'contact_persons' table only if it doesn't exist
CREATE TABLE IF NOT EXISTS contact_persons (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role_designation VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL
);

-- Create the 'insurance_types' table only if it doesn't exist
CREATE TABLE IF NOT EXISTS insurance_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(255) UNIQUE NOT NULL
);

-- Create the 'organization_insurance_types' table to link organizations with insurance types
CREATE TABLE IF NOT EXISTS organization_insurance_types (
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    insurance_type_id INTEGER REFERENCES insurance_types(id) ON DELETE CASCADE,
    PRIMARY KEY (organization_id, insurance_type_id)
);

-- Create the 'payment_methods' table only if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    method_name VARCHAR(255) UNIQUE NOT NULL
);

-- Create the 'organization_payment_methods' table to link organizations with payment methods
CREATE TABLE IF NOT EXISTS organization_payment_methods (
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE CASCADE,
    PRIMARY KEY (organization_id, payment_method_id)
);

-- Create the 'admins' table only if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL
);

