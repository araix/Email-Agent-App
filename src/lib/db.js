import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../db/schema.js';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  logger.warn('TURSO_DATABASE_URL is not defined. Database operations will fail.');
}

const client = createClient({
  url: url || 'file:local.db', // Fallback for safety during setup
  authToken: authToken,
});

import { eq, and } from 'drizzle-orm';

export const db = drizzle(client, { schema });

export async function initializeDatabase() {
  logger.info('Using Turso database');
}

export async function getCredential(email) {
  const result = await db.select()
    .from(schema.credentials)
    .where(eq(schema.credentials.email, email))
    .limit(1);
  return result[0];
}

export async function getTemplate(name) {
  const result = await db.select()
    .from(schema.templates)
    .where(and(
      eq(schema.templates.name, name),
      eq(schema.templates.active, true)
    ))
    .limit(1);
  return result[0];
}

export * from '../db/schema.js';
