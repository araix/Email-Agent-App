import { NextResponse } from 'next/server';
import { db, recipients as recipientsTable, credentials, templates } from '@/lib/db';
import { createTransporter } from '@/lib/mailer';
import { retryWithBackoff, replaceTemplateVars } from '@/lib/utils';
import { eq, and, isNull, lt, inArray } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/auth';

import { env } from '@/lib/env';
import { LEAD_STATUS } from '@/lib/constants';

export async function POST(request) {
    const authHeader = request.headers.get('x-cron-secret');
    if (authHeader !== env.CRON_SECRET && !(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        let body = {};
        try {
            body = await request.json();
        } catch {
            // Empty or invalid JSON body - use defaults
        }
        const waitDays = body.waitDays !== undefined ? body.waitDays : 2;
        const skipWait = body.skipWait === true;

        // 1. Get Sender Credential
        const finalCreds = await db.select().from(credentials).where(eq(credentials.type, 'final')).limit(1);
        const cred = finalCreds[0] || (await db.select().from(credentials).limit(1))[0];

        if (!cred) {
            return NextResponse.json({ error: 'No sender credentials found' }, { status: 500 });
        }

        // 2. Get ONE eligible recipient (single email per cron execution)
        const thresholdDate = new Date(Date.now() - waitDays * 86400 * 1000);

        const recipients = await db.select()
            .from(recipientsTable)
            .where(
                and(
                    inArray(recipientsTable.status, [LEAD_STATUS.FIRST_SENT, LEAD_STATUS.RESPONDED]),
                    isNull(recipientsTable.bouncedAt),
                    ...(skipWait ? [] : [lt(recipientsTable.firstEmailSentAt, thresholdDate)])
                )
            )
            .limit(1);

        if (recipients.length === 0) {
            return NextResponse.json({ message: 'No eligible recipients found', sent: 0 }, { status: 200 });
        }

        const recipient = recipients[0];

        // 3. Get the appropriate template based on recipient status
        const templateName = recipient.status === LEAD_STATUS.RESPONDED
            ? 'secondEmailResponders'
            : 'secondEmailNonResponders';

        const templateList = await db.select()
            .from(templates)
            .where(
                and(
                    eq(templates.name, templateName),
                    eq(templates.active, true)
                )
            )
            .limit(1);

        const template = templateList[0];

        if (!template) {
            return NextResponse.json({
                error: `Template "${templateName}" not found or inactive`,
                email: recipient.email
            }, { status: 500 });
        }

        // 4. Send email to single recipient
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

        const info = await retryWithBackoff(async () => {
            return await transporter.sendMail(mailOptions);
        });

        await db.update(recipientsTable)
            .set({
                secondEmailSentAt: new Date(),
                secondEmailMessageId: info.messageId,
                status: LEAD_STATUS.SECOND_SENT
            })
            .where(eq(recipientsTable.id, recipient.id));

        return NextResponse.json({
            message: 'Follow-up email sent successfully',
            sent: 1,
            email: recipient.email,
            template: templateName,
            threaded: !!recipient.firstEmailMessageId
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
