import pool from './pool.js';

export async function checkDatabaseConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, code: err.code, message: err.message };
  } finally {
    client.release();
  }
}
