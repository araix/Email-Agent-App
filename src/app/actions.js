'use server';

import { db } from '@/db';
import { recipients, templates, credentials } from '@/db/schema';
import { isAuthenticated } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sql } from 'drizzle-orm';

export async function getLeads() {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }
    return await db.select().from(recipients).orderBy(recipients.createdAt);
}

export async function getLeadById(id) {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }
    const results = await db.select().from(recipients).where(sql`${recipients.id} = ${id}`);
    return results[0];
}

export async function addLead(name, email, company) {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }

    try {
        await db.insert(recipients).values({
            name,
            email,
            company,
            status: 'pending',
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function importLeads(text) {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }

    const lines = text.split('\n').filter(line => line.trim());
    const leadsToInsert = [];
    const errors = [];

    for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            const name = parts[0];
            const email = parts[1];
            const company = parts[2] || null;

            if (email && email.includes('@')) {
                leadsToInsert.push({
                    name,
                    email,
                    company,
                    status: 'pending'
                });
            } else {
                errors.push(`Invalid email in line: ${line}`);
            }
        } else {
            errors.push(`Invalid format in line: ${line}`);
        }
    }

    if (leadsToInsert.length === 0) {
        return { success: false, error: 'No valid leads found. ' + errors.join('; ') };
    }

    try {
        // Simple sequential insert to handle conflicts more easily or use onConflictDoUpdate
        let count = 0;
        for (const lead of leadsToInsert) {
            try {
                await db.insert(recipients).values(lead).onConflictDoNothing();
                count++;
            } catch (e) {
                // Ignore individual failures (likely duplicates)
            }
        }

        revalidatePath('/');
        return { success: true, count, total: leadsToInsert.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logoutAction() {
    const { logout } = await import('@/lib/auth');
    await logout();
    revalidatePath('/');
}

// Template Actions
export async function getTemplates() {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }
    return await db.select().from(templates);
}

export async function upsertTemplate(data) {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }
    const { id, ...values } = data;

    // If setting to active, deactivate others of same name
    if (values.active) {
        await db.update(templates)
            .set({ active: false })
            .where(sql`${templates.name} = ${values.name}`);
    }

    if (id) {
        await db.update(templates).set(values).where(sql`${templates.id} = ${id}`);
    } else {
        await db.insert(templates).values(values);
    }
    revalidatePath('/templates');
    return { success: true };
}

// Credential Actions
export async function getCredentials() {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }
    return await db.select().from(credentials);
}

export async function upsertCredential(data) {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }
    const { id, updatedAt, ...values } = data;
    const finalValues = {
        ...values,
        updatedAt: new Date()
    };

    if (id) {
        await db.update(credentials).set(finalValues).where(sql`${credentials.id} = ${id}`);
    } else {
        await db.insert(credentials).values(finalValues);
    }
    revalidatePath('/credentials');
    return { success: true };
}
