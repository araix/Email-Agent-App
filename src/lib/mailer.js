import nodemailer from 'nodemailer';

export function createTransporter(cred) {
    // Determine if we use merged schema fields or old schema fields
    const host = cred.smtpHost || cred.host;
    const port = cred.smtpPort || cred.port;
    const user = cred.smtpUser || cred.user;
    const pass = cred.smtpPassword || cred.appPassword;

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass
        }
    });
}
