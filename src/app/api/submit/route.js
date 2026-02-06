import { NextResponse } from 'next/server';
import { db, recipients } from '@/lib/db';
import { env } from '@/lib/env';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, company, secret } = body;

        // 1. Verify Secret Phrase
        if (!secret || secret.trim() !== env.SUBMISSION_SECRET) {
            return NextResponse.json(
                { error: 'Invalid secret phrase. Access denied.' },
                { status: 401 }
            );
        }

        // 2. Validate Required Fields
        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // 3. Insert into Database
        try {
            await db.insert(recipients).values({
                name: name ? name.trim() : null,
                email: email.trim(),
                company: company ? company.trim() : null,
                status: 'pending', // Default status for new leads
            });

            return NextResponse.json(
                { success: true, message: 'Lead submitted successfully' },
                { status: 201 }
            );

        } catch (dbError) {
            // Check for unique constraint violation (duplicate email)
            if (dbError.message && (dbError.message.includes('UNIQUE constraint') || dbError.code === 'SQLITE_CONSTRAINT')) {
                return NextResponse.json(
                    { error: 'This email is already registered.' },
                    { status: 409 }
                );
            }
            throw dbError; // Rethrow other DB errors to be caught below
        }

    } catch (error) {
        console.error('Submission API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
