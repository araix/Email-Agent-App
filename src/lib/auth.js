import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';

export async function login(username, password) {
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, 'authenticated', { expires, httpOnly: true, secure: true });
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
    const session = cookieStore.get(SESSION_COOKIE);
    return session?.value === 'authenticated';
}
