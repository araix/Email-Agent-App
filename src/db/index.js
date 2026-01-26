import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    throw new Error('TURSO_DATABASE_URL is not defined in .env');
}

export const client = createClient({
    url,
    authToken,
});

export const db = drizzle(client, { schema });
export * from './schema.js';
