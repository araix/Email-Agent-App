# Email Outreach Automation System (Turso + Drizzle ORM)

A production-ready Node.js command-line tool for automating email outreach campaigns with response tracking, follow-ups, and cloud-backed analytics using **Turso DB** and **Drizzle ORM**.

## 🌟 Key Features

- ✅ **Cloud-Backed Storage**: Uses **Turso (LibSQL)** for a resilient, cloud-hosted database.
- ✅ **Type-Safe Queries**: Built with **Drizzle ORM** for reliable database interactions.
- ✅ **Two-Stage Campaigns**: Automate personalized hook emails and follow-ups.
- ✅ **Smart Tracking**: IMAP-based response detection and automatic delivery failure (bounce) detection.
- ✅ **Centralized Config**: Manage email credentials, delays, and templates directly in the database.
- ✅ **Safety First**: Dry-run modes, rate limit protection, and exponential backoff retries.

## 🛠️ Prerequisites

- **Node.js**: Version 16 or newer.
- **Turso Database**: A free-tier Turso database.
- **Gmail**: An account with **App Passwords** enabled for SMTP/IMAP access.

## 🚀 Installation

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file with your Turso credentials:
   ```env
   TURSO_DATABASE_URL=libsql://your-database-name.turso.io
   TURSO_AUTH_TOKEN=your-very-long-auth-token
   ```
4. **Push Schema**:
   Synchronize your Turso database with the application schema:
   ```bash
   npm run db:push
   ```

## 📋 Usage

### 1. Initialize Campaign
Import your recipient list from a CSV file (columns: `name`, `email`):
```bash
node outreach.js init recipients.csv
```

### 2. Send First Emails
```bash
# Send emails using the first available credential in Turso
node outreach.js send-first --batch-size 50 --delay 60

# Specify a specific sender email from your database
node outreach.js send-first --email your-email@gmail.com --dry-run
```

### 3. Check for Responses
```bash
node outreach.js check-responses --email your-email@gmail.com
```
*Detects replies and bounces automatically and updates recipient statuses.*

### 4. Send Follow-ups
```bash
# Send to non-responders after the default 2-day wait
node outreach.js send-second --to non-responders
```

### 5. View Analytics
```bash
node outreach.js stats
```

## ⚙️ Management

- **Database Studio**: View and edit your cloud data in a beautiful UI:
  ```bash
  npm run db:studio
  ```
- **Email Validation**: clean your lists before importing:
  ```bash
  npm run validate recipients.csv
  ```
- **Reset Campaign**: Wipe all tracking data (Careful!):
  ```bash
  node outreach.js reset
  ```

## 🔒 Security
- All sensitive credentials (passwords, hosts) are stored in your encrypted Turso database.
- Use `.env` only for the primary database connection strings.

## ⚖️ License
ISC
