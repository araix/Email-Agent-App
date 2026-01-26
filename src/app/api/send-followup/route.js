import { NextResponse } from 'next/server';
import { db, recipients as recipientsTable, credentials, templates } from '@/lib/db';
import { createTransporter } from '@/lib/mailer';
import { retryWithBackoff, replaceTemplateVars } from '@/lib/utils';
import { eq, and, isNull, lt, inArray } from 'drizzle-orm';
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
            // Empty or invalid JSON body - use defaults
        }
        const batchSize = body.batchSize || 5;
        const waitDays = body.waitDays !== undefined ? body.waitDays : 2;
        const skipWait = body.skipWait === true;

        // 1. Get Sender Credential
        const finalCreds = await db.select().from(credentials).where(eq(credentials.type, 'final')).limit(1);
        const cred = finalCreds[0] || (await db.select().from(credentials).limit(1))[0];

        if (!cred) {
            return NextResponse.json({ error: 'No sender credentials found' }, { status: 500 });
        }

        // 2. Get eligible recipients (first_sent or responded, not bounced, waited enough time)
        const thresholdDate = new Date(Date.now() - waitDays * 86400 * 1000);

        let query = db.select()
            .from(recipientsTable)
            .where(
                and(
                    inArray(recipientsTable.status, ['first_sent', 'responded']),
                    isNull(recipientsTable.bouncedAt),
                    ...(skipWait ? [] : [lt(recipientsTable.firstEmailSentAt, thresholdDate)])
                )
            )
            .limit(batchSize);

        const recipients = await query;

        if (recipients.length === 0) {
            return NextResponse.json({ message: 'No eligible recipients found', sent: 0 }, { status: 200 });
        }

        // 3. Load both templates upfront
        const templateList = await db.select()
            .from(templates)
            .where(
                and(
                    inArray(templates.name, ['secondEmailNonResponders', 'secondEmailResponders']),
                    eq(templates.active, true)
                )
            );

        const templateMap = {};
        for (const t of templateList) {
            templateMap[t.name] = t;
        }

        // 4. Send emails based on recipient status
        const transporter = createTransporter(cred);
        let sentCount = 0;
        let failedCount = 0;
        const results = [];

        for (const recipient of recipients) {
            // Pick template based on recipient status
            const templateName = recipient.status === 'responded' 
                ? 'secondEmailResponders' 
                : 'secondEmailNonResponders';
            
            const template = templateMap[templateName];

            if (!template) {
                results.push({ email: recipient.email, status: 'skipped', error: `Template "${templateName}" not found or inactive` });
                continue;
            }

            try {
                const vars = {
                    name: recipient.name,
                    Name: recipient.name,
                    firstName: recipient.name ? recipient.name.split(' ')[0] : '',
                    email: recipient.email,
                    company: recipient.company || '',
                    senderName: template.senderName || 'Sender',
                    senderCompany: template.senderCompany || ''
                };

                const subject = replaceTemplateVars(template.subject, vars);
                const bodyContent = replaceTemplateVars(template.body, vars);

                const mailOptions = {
                    from: `"${vars.senderName}" <${cred.email}>`,
                    to: recipient.email,
                    subject: subject,
                    text: bodyContent,
                    headers: {
                        'X-Campaign': 'second-email',
                        'X-Recipient-ID': recipient.id
                    }
                };

                // Thread with first email if available
                if (recipient.firstEmailMessageId) {
                    mailOptions.headers['In-Reply-To'] = recipient.firstEmailMessageId;
                    mailOptions.headers['References'] = recipient.firstEmailMessageId;
                }

                await retryWithBackoff(async () => {
                    return await transporter.sendMail(mailOptions);
                });

                await db.update(recipientsTable)
                    .set({
                        secondEmailSentAt: new Date(),
                        status: 'second_sent'
                    })
                    .where(eq(recipientsTable.id, recipient.id));

                sentCount++;
                results.push({ 
                    email: recipient.email, 
                    status: 'sent', 
                    template: templateName,
                    threaded: !!recipient.firstEmailMessageId 
                });
            } catch (error) {
                console.error(`Failed to send follow-up to ${recipient.email}:`, error);
                failedCount++;
                results.push({ email: recipient.email, status: 'failed', error: error.message });
            }
        }

        return NextResponse.json({
            message: 'Follow-up batch complete',
            sent: sentCount,
            failed: failedCount,
            details: results
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
