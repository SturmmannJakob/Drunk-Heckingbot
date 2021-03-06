import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err: Error, client: PoolClient) => {
  console.error('There was a fatal error with the Postgres Pool', err);
  console.error('An error occurred for the following client', client);
});

export default function query(queryText: any, values?: any) {
  return pool.query(queryText, values);
}

export async function connectToPGPool() {
  return await pool.connect();
}
