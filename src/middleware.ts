import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

// SQL injection and malicious request pattern filters
function isMalicious(urlStr: string): boolean {
  const decoded = decodeURIComponent(urlStr).toLowerCase();
  const patterns = [
    /union\s+select/i,
    /select\s+.*\s+from/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /drop\s+table/i,
    /update\s+.*\s+set/i,
    /--/,
    /\/\*/,
    /pg_sleep\(/i,
    /<script/i,
    /javascript:/i
  ];
  return patterns.some(pattern => pattern.test(decoded));
}

// Log API Requests to console
function logApiRequest(ip: string, method: string, path: string) {
  console.log(`[API Request] Method: ${method}, Path: ${path}, IP: ${ip}, Time: ${new Date().toISOString()}`);
}

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. Block obviously malicious requests (SQL injection, script injections)
  if (isMalicious(request.url)) {
    console.warn(`[Blocked Malicious Request] IP: ${ip}, Path: ${pathname}`);
    return new NextResponse(
      JSON.stringify({ error: 'Bad Request: Malicious activity detected' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Log API Requests
  if (pathname.startsWith('/api')) {
    logApiRequest(ip, method, pathname);
  }

  // 3. Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    let limit = 60; // default 60 requests per minute
    let windowMs = 60000; // 1 minute

    if (pathname.startsWith('/api/orders/track')) {
      limit = 10;
    } else if (pathname.startsWith('/api/discount/validate')) {
      limit = 5;
    } else if (pathname.startsWith('/api/orders/create') || pathname.startsWith('/api/orders/verify-payment')) {
      limit = 10;
    }

    const rateLimitResult = await rateLimit(`ratelimit:${ip}:${pathname}`, limit, windowMs);
    if (!rateLimitResult.success) {
      console.warn(`[Rate Limit Exceeded] IP: ${ip}, Path: ${pathname}`);
      return new NextResponse(
        JSON.stringify({ error: `Too many requests. Please retry in ${rateLimitResult.reset} seconds.` }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.reset)
          }
        }
      );
    }
  }

  // 4. Protection for Admin Routes (pages & APIs) via Clerk
  if (isAdminRoute(request)) {
    // Exclude the login page itself to allow loading of the form
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const session = await auth();
    if (!session.userId) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized: Session missing' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role check - role must be 'admin' in Clerk metadata
    let userRole = (session.sessionClaims?.metadata as any)?.role || (session.sessionClaims?.publicMetadata as any)?.role;

    // Fallback: If role is not mapped in sessionClaims, fetch it directly from the Clerk Backend API
    if (!userRole && session.userId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(session.userId);
        userRole = (user.publicMetadata as any)?.role;
      } catch (err) {
        console.error('Clerk middleware metadata fetch failed:', err);
      }
    }

    if (userRole !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized: Admins only' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const unauthorizedUrl = new URL('/admin/login?error=unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
