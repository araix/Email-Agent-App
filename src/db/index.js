// Re-export everything from the centralized db module to maintain import compatibility
// This avoids duplicate database connections by using a single source of truth

export { db, client, getCredential, getTemplate, initializeDatabase } from '../lib/db.js';
export * from './schema.js';
