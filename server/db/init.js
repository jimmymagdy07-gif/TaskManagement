import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDatabase } from './ensureDatabase.js';
import pool from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getSeedSql(schema) {
  const seedStart = schema.indexOf('-- Seed data');
  if (seedStart === -1) {
    throw new Error('Seed section not found in schema.sql');
  }
  return schema.slice(seedStart);
}

function getSeedSqlWithTruncate(schema) {
  const seedSql = getSeedSql(schema);
  const truncateSql = `TRUNCATE TABLE task_label_map, task_labels, task_comments, tasks, project_members, projects, users RESTART IDENTITY CASCADE;\n\n`;
  return truncateSql + seedSql;
}

async function init() {
  const isSeedOnly = process.argv.includes('--seed-only');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const sql = isSeedOnly ? getSeedSqlWithTruncate(schema) : schema;

  if (!isSeedOnly) {
    try {
      await ensureDatabase();
    } catch (err) {
      console.error('Failed to create database:', err.message);
      console.error(
        '\nMake sure PostgreSQL is running and DATABASE_URL credentials are correct.'
      );
      process.exit(1);
    }
  }

  try {
    await pool.query(sql);
    if (isSeedOnly) {
      console.log('Seed data executed successfully.');
      console.log('Your production database now contains the demo users, projects, tasks, and comments.');
    } else {
      console.log('Database schema initialized successfully.');
      console.log('Guest demo user seeded (see .env.example for VITE_GUEST_* credentials).');
    }
  } catch (err) {
    console.error(isSeedOnly ? 'Failed to seed database:' : 'Failed to initialize database:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
