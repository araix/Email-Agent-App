import fs from 'fs';
import dns from 'dns';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../src/lib/logger.js';
import { validateEmail, sleep } from '../src/lib/utils.js';

const resolveMx = promisify(dns.resolveMx);

// --- Advanced Validation Data ---
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', '10minutemail.com', 'temp-mail.org', 'guerrillamail.com',
    'sharklasers.com', 'dispostable.com', 'getnada.com', 'maildrop.cc'
]);

// Set DNS servers for reliability
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function resolveMxWithRetry(domain, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await resolveMx(domain);
        } catch (err) {
            if (i === retries) throw err;
            await sleep(500);
        }
    }
}

async function validate() {
    const INPUT_FILE = process.argv[2] || 'emails.txt';
    const VALID_OUTPUT_FILE = 'valid_emails.txt';
    const INVALID_OUTPUT_FILE = 'invalid_emails.txt';

    logger.info(`Reading emails from ${INPUT_FILE}...`);

    let rawLines = [];
    try {
        const data = fs.readFileSync(INPUT_FILE, 'utf8');
        rawLines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    } catch (err) {
        logger.error(`Error reading ${INPUT_FILE}. Make sure the file exists.`);
        return;
    }

    if (rawLines.length > 0 && rawLines[0].toLowerCase().includes('name') && rawLines[0].toLowerCase().includes('email')) {
        rawLines.shift();
    }

    logger.info(`Found ${rawLines.length} entries. Starting validation...`);

    const validEntries = [];
    const invalidEmails = [];

    for (const line of rawLines) {
        let name, email;
        const lastCommaIndex = line.lastIndexOf(',');

        if (lastCommaIndex !== -1) {
            name = line.substring(0, lastCommaIndex).trim();
            email = line.substring(lastCommaIndex + 1).trim().toLowerCase();
        } else {
            const parts = line.split(/\t|\s{2,}/);
            name = parts.length > 1 ? parts[0].trim() : 'Subscriber';
            email = parts[parts.length - 1].trim().toLowerCase();
        }

        if (!validateEmail(email)) {
            logger.warn(`[INVALID SYNTAX] ${email}`);
            invalidEmails.push(`${email} (Syntax)`);
            continue;
        }

        const domain = email.split('@')[1];
        if (DISPOSABLE_DOMAINS.has(domain)) {
            logger.warn(`[DISPOSABLE] ${email} - Skipping`);
            invalidEmails.push(`${email} (Disposable)`);
            continue;
        }

        try {
            const addresses = await resolveMxWithRetry(domain).catch(err => {
                if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') return [];
                throw err;
            });

            if (addresses && addresses.length > 0) {
                logger.info(`[VALID] ${email} (${name})`);
                validEntries.push(`${name},${email}`);
            } else {
                logger.warn(`[INVALID DOMAIN] ${email}`);
                invalidEmails.push(`${email} (No MX Records)`);
            }
        } catch (err) {
            logger.error(`[DNS ERROR] ${email} - ${err.code || err.message}`);
            invalidEmails.push(`${email} (DNS Error: ${err.code || 'Unknown'})`);
        }

        await sleep(50);
    }

    fs.writeFileSync(VALID_OUTPUT_FILE, validEntries.join('\n'));
    fs.writeFileSync(INVALID_OUTPUT_FILE, invalidEmails.join('\n'));

    logger.info('\n--- Validation Complete ---');
    logger.info(`Valid Entries: ${validEntries.length} (Saved to ${VALID_OUTPUT_FILE})`);
    logger.info(`Invalid Emails: ${invalidEmails.length} (Saved to ${INVALID_OUTPUT_FILE})`);
}

validate().catch(err => {
    logger.error(`Validation failed: ${err.message}`);
    process.exit(1);
});

