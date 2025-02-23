import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file (only for local development)
dotenv.config();

// Use DATABASE_URL from Heroku in production
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Necessary for SSL connections on Heroku
  },
});

export default pool;
