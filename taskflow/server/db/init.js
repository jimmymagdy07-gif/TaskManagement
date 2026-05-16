import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDatabase } from './ensureDatabase.js';
import pool from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  try {
    await ensureDatabase();
  } catch (err) {
    console.error('Failed to create database:', err.message);
    console.error(
      '\nMake sure PostgreSQL is running and DATABASE_URL credentials are correct.'
    );
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(schema);
    console.log('Database schema initialized successfully.');
    console.log('Guest demo user seeded (see .env.example for VITE_GUEST_* credentials).');
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
