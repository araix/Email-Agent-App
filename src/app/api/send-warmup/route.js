import { NextResponse } from 'next/server';
import { db, recipients as recipientsTable, credentials, templates } from '@/lib/db';
import { createTransporter } from '@/lib/mailer';
import { retryWithBackoff, replaceTemplateVars } from '@/lib/utils';
import { eq, and, isNull } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request) {
    const authHeader = request.headers.get('x-cron-secret');
    if (authHeader !== process.env.CRON_SECRET && !(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Get Sender Credential (Warmup)
        const warmupCreds = await db.select().from(credentials).where(eq(credentials.type, 'warmup')).limit(1);
        let senderEmail;

        if (warmupCreds.length > 0) {
            senderEmail = warmupCreds[0].email;
        } else {
            // Fallback to any
            const anyCred = await db.select().from(credentials).limit(1);
            if (anyCred.length > 0) senderEmail = anyCred[0].email;
        }

        if (!senderEmail) {
            return NextResponse.json({ error: 'No sender credentials found' }, { status: 500 });
        }

        const cred = warmupCreds[0] || (await db.select().from(credentials).where(eq(credentials.email, senderEmail)).limit(1))[0];

        // 2. Get Template
        const templateList = await db.select().from(templates).where(and(eq(templates.name, 'firstEmail'), eq(templates.active, true))).limit(1);
        const template = templateList[0];

        if (!template) {
            return NextResponse.json({ error: 'Template "firstEmail" not found or inactive' }, { status: 500 });
        }

        // 3. Get ONE recipient (single email per cron execution)
        const recipients = await db.select()
            .from(recipientsTable)
            .where(
                and(
                    eq(recipientsTable.status, 'pending'),
                    isNull(recipientsTable.bouncedAt)
                )
            )
            .limit(1);

        if (recipients.length === 0) {
            return NextResponse.json({ message: 'No pending recipients found', sent: 0 }, { status: 200 });
        }

        const recipient = recipients[0];

        // 4. Send Email to single recipient
        const transporter = createTransporter(cred);

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

        const info = await retryWithBackoff(async () => {
            return await transporter.sendMail({
                from: `"${vars.senderName}" <${senderEmail}>`,
                to: recipient.email,
                subject: subject,
                text: bodyContent,
                headers: {
                    'X-Campaign': 'first-email',
                    'X-Recipient-ID': recipient.id
                }
            });
        });

        await db.update(recipientsTable)
            .set({
                firstEmailSentAt: new Date(),
                firstEmailMessageId: info.messageId,
                status: 'first_sent'
            })
            .where(eq(recipientsTable.id, recipient.id));

        return NextResponse.json({
            message: 'Email sent successfully',
            sent: 1,
            email: recipient.email,
            messageId: info.messageId
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
