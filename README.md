# Email Outreach Automation System

A Next.js application for automating email outreach campaigns with response tracking, follow-ups, and cloud-backed storage using **Turso DB** and **Drizzle ORM**.

## Features

- **Cloud Database**: Turso (LibSQL) for resilient, cloud-hosted storage
- **Two-Stage Campaigns**: Automated first emails and smart follow-ups
- **Response Detection**: IMAP-based reply and bounce tracking
- **Template System**: Dynamic email templates with variable substitution
- **API-Driven**: RESTful endpoints for cron job integration

## Prerequisites

- Node.js 18+
- Turso Database account
- Gmail with App Passwords enabled (or other SMTP/IMAP provider)
- [cron-job.org](https://cron-job.org) account (free)

## Installation

1. Clone and install:
   ```bash
   npm install
   ```

2. Create `.env`:
   ```env
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   CRON_SECRET=your-secret-key
   ```

3. Push database schema:
   ```bash
   npm run db:push
   ```

4. Run locally:
   ```bash
   npm run dev
   ```

## API Endpoints

All endpoints require the `x-cron-secret` header matching your `CRON_SECRET` env variable.

### POST /api/send-warmup
Sends first emails to pending recipients.

```bash
curl -X POST https://your-app.vercel.app/api/send-warmup \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10}'
```

### POST /api/send-followup
Sends follow-up emails based on recipient status. Automatically uses:
- `secondEmailResponders` template for recipients who replied
- `secondEmailNonResponders` template for recipients who didn't reply

```bash
curl -X POST https://your-app.vercel.app/api/send-followup \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10, "waitDays": 2}'
```

### POST /api/check-responses
Checks IMAP inbox for replies and bounces, updates recipient statuses.

```bash
curl -X POST https://your-app.vercel.app/api/check-responses \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Cron Job Setup (cron-job.org)

### Step 1: Create Account
Sign up at [cron-job.org](https://cron-job.org) (free tier allows 3 cron jobs).

### Step 2: Create Cron Jobs

Create three cron jobs with the following settings:

#### Job 1: Send First Emails
- **Title**: Send Warmup Emails
- **URL**: `https://your-app.vercel.app/api/send-warmup`
- **Schedule**: Every 30 minutes (or your preferred interval)
- **Request Method**: POST
- **Request Headers**:
  ```
  x-cron-secret: your-secret
  Content-Type: application/json
  ```
- **Request Body**: `{"batchSize": 5}`

#### Job 2: Check Responses
- **Title**: Check Email Responses
- **URL**: `https://your-app.vercel.app/api/check-responses`
- **Schedule**: Every hour
- **Request Method**: POST
- **Request Headers**:
  ```
  x-cron-secret: your-secret
  Content-Type: application/json
  ```
- **Request Body**: `{}`

#### Job 3: Send Follow-ups
- **Title**: Send Follow-up Emails
- **URL**: `https://your-app.vercel.app/api/send-followup`
- **Schedule**: Once daily (e.g., 9:00 AM)
- **Request Method**: POST
- **Request Headers**:
  ```
  x-cron-secret: your-secret
  Content-Type: application/json
  ```
- **Request Body**: `{"batchSize": 10, "waitDays": 2}`

### Step 3: Configure Headers in cron-job.org

1. Click "Create cronjob"
2. Fill in URL and schedule
3. Expand "Advanced" section
4. Under "Headers", click "Add header"
5. Add both headers:
   - Header 1: `x-cron-secret` = `your-secret`
   - Header 2: `Content-Type` = `application/json`
6. Under "Request body", paste the JSON body
7. Save the cron job

### Recommended Schedule

| Job | Frequency | Purpose |
|-----|-----------|---------|
| send-warmup | Every 30 min | Send first emails in small batches |
| check-responses | Every 1 hour | Detect replies and bounces |
| send-followup | Once daily | Send follow-ups to eligible recipients |

## Required Templates

Create these templates in your database (via the UI or directly):

1. **firstEmail** - Initial outreach email
2. **secondEmailNonResponders** - Follow-up for non-responders
3. **secondEmailResponders** - Follow-up for those who replied

Template variables: `{{name}}`, `{{firstName}}`, `{{email}}`, `{{company}}`, `{{senderName}}`, `{{senderCompany}}`

## Database Management

```bash
# View/edit data in browser
npm run db:studio

# Push schema changes
npm run db:push
```

## Security

- Store `CRON_SECRET` securely in environment variables
- Use strong, unique secrets for production
- All credentials stored encrypted in Turso

## License

ISC
