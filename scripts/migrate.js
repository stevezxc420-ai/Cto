const pool = require('../src/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Starting database migration...');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
    `;

    await pool.query(createTableQuery);
    console.log('✓ Users table created');

    await pool.query(createIndexQuery);
    console.log('✓ Email index created');

    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
