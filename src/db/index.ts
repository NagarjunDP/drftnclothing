import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

const databaseUrl = process.env.DATABASE_URL;
const isNeon = databaseUrl.includes('neon.tech');

// Connect using Neon HTTP driver if Neon URL is provided, otherwise fall back to standard PostgreSQL Pool
export const db = isNeon
  ? drizzleNeon(neon(databaseUrl), { schema })
  : (drizzlePg(new Pool({ connectionString: databaseUrl }), { schema }) as any);

export type DbClient = typeof db;
