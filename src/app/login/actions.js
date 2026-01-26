'use server';

import { login } from '@/lib/auth';

import { redirect } from 'next/navigation';

export async function loginAction(username, password) {
    const success = await login(username, password);
    return { success };
}

export async function loginFormAction(prevState, formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    const success = await login(username, password);

    if (success) {
        redirect('/');
    } else {
        return { error: 'Invalid credentials' };
    }
}
