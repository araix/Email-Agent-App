'use server';

import { db } from '@/lib/db';
import { recipients, templates, credentials } from '@/db/schema';
import { isAuthenticated } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sql, eq } from 'drizzle-orm';
import { validateEmail } from '@/lib/utils';
import { LEAD_STATUS } from '@/lib/constants';

export async function getLeads(page = 1, limit = 50) {
    if (!(await isAuthenticated())) {
        throw new Error('Not authenticated');
    }

    const offset = (page - 1) * limit;

    const leads = await db.select()
        .from(recipients)
        .orderBy(recipients.createdAt) // Note: Default sorting by Oldest First as per original code, can be changed.
        .limit(limit)
        .offset(offset);

    // Get total count for pagination
    // Ideally use count() function but simple select works for moderate datasets
    const allLeads = await db.select({ id: recipients.id }).from(recipients);
    const total = allLeads.length;

    return {
        leads,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
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
            status: LEAD_STATUS.PENDING,
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
            const email = parts[1].toLowerCase();
            const company = parts[2] || null;

            // Use proper email validation instead of simple @ check
            if (validateEmail(email)) {
                leadsToInsert.push({
                    name,
                    email,
                    company,
                    status: LEAD_STATUS.PENDING
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
        let insertedCount = 0;
        let skippedCount = 0;

        for (const lead of leadsToInsert) {
            try {
                // Check if email already exists
                const existing = await db.select({ id: recipients.id })
                    .from(recipients)
                    .where(eq(recipients.email, lead.email))
                    .limit(1);

                if (existing.length === 0) {
                    await db.insert(recipients).values(lead);
                    insertedCount++;
                } else {
                    skippedCount++;
                }
            } catch (e) {
                // Log but continue with other leads
                console.error(`Failed to insert lead ${lead.email}:`, e.message);
            }
        }

        revalidatePath('/');
        return {
            success: true,
            count: insertedCount,
            skipped: skippedCount,
            total: leadsToInsert.length
        };
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
