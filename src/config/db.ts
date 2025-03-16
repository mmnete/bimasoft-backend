import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file (only for local development)
dotenv.config();

// Use DATABASE_URL from Heroku in production
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || '',
    ssl: false
    // ssl: {
    //     rejectUnauthorized: false, // This is sometimes necessary for Heroku PostgreSQL SSL connections. Disable when runnig locally
    //   },
});

export default pool;
