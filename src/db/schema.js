import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const credentials = sqliteTable('credentials', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),

    // SMTP (Sending)
    smtpHost: text('smtp_host'),
    smtpPort: integer('smtp_port'),
    smtpUser: text('smtp_user'),
    smtpPassword: text('smtp_password'),

    // IMAP (Receiving)
    imapHost: text('imap_host'),
    imapPort: integer('imap_port'),
    imapUser: text('imap_user'),
    imapPassword: text('imap_password'),

    // Connection Settings
    tls: integer('tls', { mode: 'boolean' }).default(true),
    authTimeout: integer('auth_timeout').default(10000),

    // Delays and Limits (Global for this email account)
    betweenEmails: integer('between_emails'),
    betweenBatches: integer('between_batches'),
    dailyLimit: integer('daily_limit'),
    batchSize: integer('batch_size'),

    // Category
    type: text('type').default('warmup'), // 'warmup' or 'final'

    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const templates = sqliteTable('templates', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(), // e.g., 'firstEmail', 'followup'
    active: integer('active', { mode: 'boolean' }).default(false),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    senderName: text('sender_name'),
    senderCompany: text('sender_company'),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const recipients = sqliteTable('recipients', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    name: text('name'),
    company: text('company'),
    status: text('status').default('pending').notNull(),

    // First Email Tracking
    firstEmailSentAt: integer('first_email_sent_at', { mode: 'timestamp' }),
    firstEmailMessageId: text('first_email_message_id'),

    // Second Email Tracking
    secondEmailSentAt: integer('second_email_sent_at', { mode: 'timestamp' }),
    secondEmailMessageId: text('second_email_message_id'),

    // Response Tracking
    respondedAt: integer('responded_at', { mode: 'timestamp' }),
    responseBody: text('response_body'),

    // Bounce Tracking
    bouncedAt: integer('bounced_at', { mode: 'timestamp' }),
    bounceReason: text('bounce_reason'),

    // Metadata
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
    return {
        statusIdx: index('idx_status').on(table.status),
        emailIdx: index('idx_email').on(table.email),
        firstMsgIdx: index('idx_first_message_id').on(table.firstEmailMessageId),
    };
});
