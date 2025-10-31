// /middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Track page visits for analytics
  const pathname = request.nextUrl.pathname;

  // Skip tracking for:
  // - API routes
  // - Static files
  // - _next files
  // - Favicon
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Track the visit asynchronously (don't block the response)
  trackVisit(pathname).catch((error) => {
    console.error('Failed to track visit:', error);
  });

  return NextResponse.next();
}

async function trackVisit(pathname: string) {
  try {
    // Call the analytics API to update the data
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/analytics/track`;

    // Use fetch with no wait to avoid blocking
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname }),
    }).catch((error) => {
      console.error('Analytics tracking failed:', error);
    });
  } catch (error) {
    // Silent fail - don't interrupt user experience
    console.error('Error tracking visit:', error);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};

