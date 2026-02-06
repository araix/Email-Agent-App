import { cookies } from 'next/headers';
import crypto from 'crypto';
import { env } from './env';

const SESSION_COOKIE = 'admin_session';
const ALGORITHM = 'aes-256-cbc';

// Generate a deterministic key from the admin password to sign/encrypt sessions
function getEncryptionKey() {
    return crypto.createHash('sha256').update(env.ADMIN_PASSWORD).digest();
}

function encrypt(data) {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Format: iv:encryptedData
    return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(text) {
    try {
        const textParts = text.split(':');
        if (textParts.length !== 2) return null;

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = textParts[1];
        const key = getEncryptionKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    } catch (error) {
        // If decryption fails (e.g. key changed, invalid data), return null
        return null;
    }
}

export async function login(username, password) {
    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
        // Create session payload
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Encrypt session data - stateless, works on Vercel/Serverless
        const sessionToken = encrypt({ expiresAt });

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, sessionToken, {
            expires: new Date(expiresAt),
            httpOnly: true,
            secure: env.IS_PROD,
            sameSite: 'lax',
            path: '/', // Ensure cookie is available on all paths
        });
        return true;
    }
    return false;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie?.value) {
        return false;
    }

    const session = decrypt(sessionCookie.value);

    if (!session || !session.expiresAt) {
        return false;
    }

    if (session.expiresAt < Date.now()) {
        // Token expired
        cookieStore.delete(SESSION_COOKIE);
        return false;
    }

    return true;
}
