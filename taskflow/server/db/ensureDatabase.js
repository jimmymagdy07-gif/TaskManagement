import pg from 'pg';
import '../config/loadEnv.js';

const { Client } = pg;

function getDatabaseName(connectionString) {
  const url = new URL(connectionString);
  const name = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!name) {
    throw new Error('DATABASE_URL must include a database name (e.g. .../taskflow)');
  }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid database name in DATABASE_URL: ${name}`);
  }
  return name;
}

function getAdminConnectionString(connectionString) {
  const url = new URL(connectionString);
  url.pathname = '/postgres';
  return url.toString();
}

export async function ensureDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const dbName = getDatabaseName(connectionString);
  const adminUrl = getAdminConnectionString(connectionString);
  const client = new Client({ connectionString: adminUrl });

  await client.connect();
  try {
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database "${dbName}".`);
    }
  } finally {
    await client.end();
  }

  return dbName;
}
