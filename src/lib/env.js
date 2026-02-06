import { logger } from './logger';

function requireEnv(key, defaultValue = undefined) {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const env = {
    TURSO_DATABASE_URL: requireEnv('TURSO_DATABASE_URL'),
    TURSO_AUTH_TOKEN: requireEnv('TURSO_AUTH_TOKEN'),

    // Auth
    ADMIN_USERNAME: requireEnv('ADMIN_USERNAME', 'admin'),
    ADMIN_PASSWORD: requireEnv('ADMIN_PASSWORD'),
    CRON_SECRET: requireEnv('CRON_SECRET'),
    SUBMISSION_SECRET: requireEnv('SUBMISSION_SECRET'),

    // App Config
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PROD: process.env.NODE_ENV === 'production',
};
