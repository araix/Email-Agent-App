import { NextResponse } from 'next/server';
import imaps from 'imap-simple';
import { db, recipients as recipientsTable, credentials, getCredential } from '@/lib/db';
import { eq, and, ne, isNull, isNotNull } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request) {
    const authHeader = request.headers.get('x-cron-secret');
    if (authHeader !== process.env.CRON_SECRET && !(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let body = {};
        try {
            body = await request.json();
        } catch {
            // Empty or invalid JSON body - use fallback logic
        }
        let imapEmail = body?.email;

        // Fallback logic
        if (!imapEmail) {
            const warmupCred = await db.select().from(credentials).where(eq(credentials.type, 'warmup')).limit(1);
            if (warmupCred.length > 0) {
                imapEmail = warmupCred[0].email;
            } else {
                const anyCred = await db.select().from(credentials).limit(1);
                if (anyCred.length > 0) imapEmail = anyCred[0].email;
            }
        }

        if (!imapEmail) {
            return NextResponse.json({ error: 'No email provided and no credentials found' }, { status: 400 });
        }

        const cred = await getCredential(imapEmail);
        if (!cred || !cred.imapHost) {
            return NextResponse.json({ error: `IMAP Credential for ${imapEmail} not found or incomplete` }, { status: 400 });
        }

        const imapConfig = {
            imap: {
                user: cred.imapUser || cred.user || cred.email,
                password: cred.imapPassword || cred.appPassword,
                host: cred.imapHost,
                port: cred.imapPort || 993,
                tls: cred.tls !== false,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: cred.authTimeout || 10000
            }
        };

        const connection = await imaps.connect(imapConfig);
        await connection.openBox('INBOX');

        const sentEmails = await db.select({
            id: recipientsTable.id,
            email: recipientsTable.email,
            firstEmailMessageId: recipientsTable.firstEmailMessageId
        })
            .from(recipientsTable)
            .where(
                and(
                    isNotNull(recipientsTable.firstEmailMessageId),
                    ne(recipientsTable.status, 'responded'),
                    isNull(recipientsTable.bouncedAt)
                )
            );

        let responsesFound = 0;
        let bouncesFound = 0;
        const details = [];

        // 1. Check for Bounces
        try {
            const bounceSearchCriteria = ['UNSEEN', ['OR', ['FROM', 'mailer-daemon'], ['FROM', 'Mail Delivery']]];
            const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
            const bounceMessages = await connection.search(bounceSearchCriteria, fetchOptions);

            for (const message of bounceMessages) {
                const bodyPart = message.parts.find(part => part.which === 'TEXT');
                if (bodyPart) {
                    const bodyText = bodyPart.body.toLowerCase();
                    const emailMatch = bodyText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                    if (emailMatch) {
                        const bouncedEmail = emailMatch[0];
                        const recipient = sentEmails.find(e => e.email.toLowerCase() === bouncedEmail);
                        if (recipient) {
                            await db.update(recipientsTable)
                                .set({ bouncedAt: new Date(), bounceReason: 'Auto-detected bounce', status: 'bounced' })
                                .where(eq(recipientsTable.id, recipient.id));
                            bouncesFound++;
                            details.push({ type: 'bounce', email: bouncedEmail });
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Bounce check error:', e);
        }

        // 2. Check for Replies
        for (const sentEmail of sentEmails) {
            try {
                const searchCriteria = ['UNSEEN', ['HEADER', 'FROM', sentEmail.email]];
                const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
                const messages = await connection.search(searchCriteria, fetchOptions);

                for (const message of messages) {
                    const headerPart = message.parts.find(part => part.which === 'HEADER');
                    const bodyPart = message.parts.find(part => part.which === 'TEXT');
                    if (headerPart && bodyPart) {
                        const h = headerPart.body;
                        const inReplyTo = h['in-reply-to'] ? h['in-reply-to'][0] : null;
                        const references = h['references'] ? h['references'][0] : null;

                        if (inReplyTo === sentEmail.firstEmailMessageId || (references && references.includes(sentEmail.firstEmailMessageId))) {
                            await db.update(recipientsTable)
                                .set({ respondedAt: new Date(), responseBody: bodyPart.body.substring(0, 1000), status: 'responded' })
                                .where(eq(recipientsTable.id, sentEmail.id));
                            responsesFound++;
                            details.push({ type: 'response', email: sentEmail.email });
                        }
                    }
                }
            } catch (e) {
                console.error(`Error checking ${sentEmail.email}:`, e);
            }
        }

        connection.end();

        return NextResponse.json({
            message: 'Check complete',
            responsesFound,
            bouncesFound,
            details
        });

    } catch (error) {
        console.error('IMAP Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
