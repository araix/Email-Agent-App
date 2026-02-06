import { NextResponse } from 'next/server';

const RATELIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per IP per minute (generous for dashboard, strict for others)

// Simple in-memory store for rate limiting (Note: resets on server restart/redeploy)
const ipRequests = new Map();

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequests.entries()) {
        if (now - data.timestamp > RATELIMIT_WINDOW) {
            ipRequests.delete(ip);
        }
    }
}, RATELIMIT_WINDOW);

export function middleware(request) {
    // Only apply to API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const ip = request.ip || 'anonymous';
        const now = Date.now();

        let clientData = ipRequests.get(ip);

        if (!clientData) {
            clientData = { count: 0, timestamp: now };
            ipRequests.set(ip, clientData);
        }

        // Reset if window passed
        if (now - clientData.timestamp > RATELIMIT_WINDOW) {
            clientData.count = 0;
            clientData.timestamp = now;
        }

        clientData.count++;

        if (clientData.count > MAX_REQUESTS) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
