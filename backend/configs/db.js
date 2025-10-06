import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const connectionString =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const client = neon(connectionString);

export const db = drizzle(client, { schema });

