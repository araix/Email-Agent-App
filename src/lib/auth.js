import { cookies } from 'next/headers';
import crypto from 'crypto';
import { env } from './env';

const SESSION_COOKIE = 'admin_session';

// In-memory session store (in production, use Redis or database)
// Note: This will reset on server restart - acceptable for admin dashboard
const activeSessions = new Map();

// Clean expired sessions periodically
function cleanExpiredSessions() {
    const now = Date.now();
    for (const [token, expiresAt] of activeSessions) {
        if (expiresAt < now) {
            activeSessions.delete(token);
        }
    }
}

export async function login(username, password) {
    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
        // Generate cryptographically secure random token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store token with expiration
        activeSessions.set(sessionToken, expires.getTime());
        cleanExpiredSessions();

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, sessionToken, {
            expires,
            httpOnly: true,
            secure: env.IS_PROD,
            sameSite: 'lax'
        });
        return true;
    }
    return false;
}

export async function logout() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);

    // Remove from active sessions
    if (session?.value) {
        activeSessions.delete(session.value);
    }

    cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);

    if (!session?.value) {
        return false;
    }

    // Validate token exists and hasn't expired
    const expiresAt = activeSessions.get(session.value);
    if (!expiresAt || expiresAt < Date.now()) {
        activeSessions.delete(session.value);
        return false;
    }

    return true;
}
