-- SQLite/Turso queries for the Email-Agents App

-- ==========================================
-- 0. SCHEMA CREATION (DDL)
-- ==========================================

-- Table: credentials
CREATE TABLE IF NOT EXISTS `credentials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`smtp_host` text,
	`smtp_port` integer,
	`smtp_user` text,
	`smtp_password` text,
	`imap_host` text,
	`imap_port` integer,
	`imap_user` text,
	`imap_password` text,
	`tls` integer DEFAULT 1,
	`auth_timeout` integer DEFAULT 10000,
	`between_emails` integer,
	`between_batches` integer,
	`daily_limit` integer,
	`batch_size` integer,
	`type` text DEFAULT 'warmup',
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);

-- Table: templates
CREATE TABLE IF NOT EXISTS `templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT 0,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`sender_name` text,
	`sender_company` text,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);

-- Table: recipients
CREATE TABLE IF NOT EXISTS `recipients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`company` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`first_email_sent_at` integer,
	`first_email_message_id` text,
	`second_email_sent_at` integer,
	`second_email_message_id` text,
	`responded_at` integer,
	`response_body` text,
	`bounced_at` integer,
	`bounce_reason` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for recipients
CREATE UNIQUE INDEX IF NOT EXISTS `recipients_email_unique` ON `recipients` (`email`);
CREATE INDEX IF NOT EXISTS `idx_status` ON `recipients` (`status`);
CREATE INDEX IF NOT EXISTS `idx_email` ON `recipients` (`email`);
CREATE INDEX IF NOT EXISTS `idx_first_message_id` ON `recipients` (`first_email_message_id`);

-- ==========================================
-- 1. DATA MANIPULATION (DML) & QUERIES
-- ==========================================

-- 1. CREDENTIALS
-- View all credentials
SELECT * FROM credentials;

-- 2. TEMPLATES
-- View all templates
SELECT * FROM templates;

-- View active templates
SELECT * FROM templates WHERE active = 1;

-- 3. RECIPIENTS
-- View all recipients
SELECT * FROM recipients;

-- View recipients by status
SELECT * FROM recipients WHERE status = 'pending';
SELECT * FROM recipients WHERE status = 'sent';
SELECT * FROM recipients WHERE status = 'responded';
SELECT * FROM recipients WHERE status = 'bounced';

-- Count recipients by status
SELECT status, COUNT(*) as count FROM recipients GROUP BY status;

-- 4. INSERT EXAMPLES
-- Insert a new recipient
INSERT INTO recipients (email, name, company, status)
VALUES ('test@example.com', 'Test User', 'Example Corp', 'pending');

-- 5. UPDATE EXAMPLES
-- Update recipient status
UPDATE recipients SET status = 'sent', first_email_sent_at = CURRENT_TIMESTAMP WHERE email = 'test@example.com';

-- 6. RESET RECIPIENTS (Careful!)
-- UPDATE recipients SET status = 'pending', first_email_sent_at = NULL, second_email_sent_at = NULL, responded_at = NULL, bounced_at = NULL;
