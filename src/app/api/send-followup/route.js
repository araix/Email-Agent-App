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
        const body = await request.json();
        const batchSize = body.batchSize || 5;
        const waitDays = body.waitDays !== undefined ? body.waitDays : 2;
        const target = body.target || 'non-responders'; // 'non-responders', 'responders', 'all'

        // 1. Get Sender Credential (Final)
        const finalCreds = await db.select().from(credentials).where(eq(credentials.type, 'final')).limit(1);
        let senderEmail;

        if (finalCreds.length > 0) {
            senderEmail = finalCreds[0].email;
        } else {
            // Fallback to any
            const anyCred = await db.select().from(credentials).limit(1);
            if (anyCred.length > 0) senderEmail = anyCred[0].email;
        }

        if (!senderEmail) {
            return NextResponse.json({ error: 'No sender credentials found' }, { status: 500 });
        }

        const cred = finalCreds[0] || (await db.select().from(credentials).where(eq(credentials.email, senderEmail)).limit(1))[0];

        // 2. Get Template
        let templateName = (target === 'responders') ? 'secondEmailResponders' : 'secondEmailNonResponders';
        const templateList = await db.select().from(templates).where(and(eq(templates.name, templateName), eq(templates.active, true))).limit(1);
        const template = templateList[0];

        if (!template) {
            return NextResponse.json({ error: `Template "${templateName}" not found or inactive` }, { status: 500 });
        }

        // 3. Get Recipients
        const waitSeconds = Math.round(waitDays * 86400);
        const thresholdDate = new Date(Date.now() - waitSeconds * 1000);

        let recipientsQuery = db.select().from(recipientsTable);

        if (target === 'non-responders') {
            recipientsQuery = recipientsQuery.where(
                and(
                    eq(recipientsTable.status, 'first_sent'),
                    isNull(recipientsTable.bouncedAt),
                    lt(recipientsTable.firstEmailSentAt, thresholdDate)
                )
            );
        } else if (target === 'responders') {
            recipientsQuery = recipientsQuery.where(
                and(
                    eq(recipientsTable.status, 'responded'),
                    isNull(recipientsTable.bouncedAt)
                )
            );
        } else {
            // all
            recipientsQuery = recipientsQuery.where(
                and(
                    inArray(recipientsTable.status, ['first_sent', 'responded']),
                    isNull(recipientsTable.bouncedAt),
                    lt(recipientsTable.firstEmailSentAt, thresholdDate)
                )
            );
        }

        const recipients = await recipientsQuery.limit(batchSize);

        if (recipients.length === 0) {
            return NextResponse.json({ message: `No recipients found for target: ${target}`, sent: 0 }, { status: 200 });
        }

        // 4. Send Emails with Threading
        const transporter = createTransporter(cred);
        let sentCount = 0;
        let failedCount = 0;
        const results = [];

        for (const recipient of recipients) {
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
                    from: `"${vars.senderName}" <${senderEmail}>`,
                    to: recipient.email,
                    subject: subject,
                    text: bodyContent,
                    headers: {
                        'X-Campaign': 'second-email',
                        'X-Recipient-ID': recipient.id
                    }
                };

                // Threading magic: In-Reply-To and References
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
                        status: 'second_sent' // Or keep 'responded' if they responded? Logic says second_sent usually implies done with sequence
                    })
                    .where(eq(recipientsTable.id, recipient.id));

                sentCount++;
                results.push({ email: recipient.email, status: 'sent', threaded: !!recipient.firstEmailMessageId });
            } catch (error) {
                console.error(`Failed to send follow-up to ${recipient.email}:`, error);
                failedCount++;
                results.push({ email: recipient.email, status: 'failed', error: error.message });
            }
        }

        return NextResponse.json({
            message: 'Follow-up batch processing complete',
            sent: sentCount,
            failed: failedCount,
            details: results
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
