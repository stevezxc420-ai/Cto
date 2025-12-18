import { Pool } from 'pg';
import { env } from './env';

const connectionString = env.databaseUrl;
if (!connectionString) {
  throw new Error('DATABASE_URL must be set');
}

export const pool = new Pool({
  connectionString
});

export async function initDb(options?: { retries?: number; delayMs?: number }): Promise<void> {
  const retries = options?.retries ?? 15;
  const delayMs = options?.delayMs ?? 1000;

  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
