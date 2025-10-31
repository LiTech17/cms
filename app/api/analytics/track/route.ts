// /app/api/analytics/track/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getJSON, updateJSON } from '@/lib/github';

interface AnalyticsData {
  totalVisits: number;
  pageVisits: Record<string, number>;
  visitsByDate: Array<{ date: string; visits: number }>;
  topPages: Array<{ path: string; visits: number }>;
}

export async function POST(request: NextRequest) {
  try {
    const { pathname } = await request.json();

    if (!pathname) {
      return NextResponse.json({ message: 'Pathname is required' }, { status: 400 });
    }

    // Normalize pathname (remove trailing slashes except root)
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '') || '/';

    // Get current analytics data
    const analyticsResult = await getJSON('data/analytics.json');
    const analyticsData: AnalyticsData = analyticsResult?.content || {
      totalVisits: 0,
      pageVisits: {},
      visitsByDate: [],
      topPages: [],
    };

    // Update total visits
    analyticsData.totalVisits = (analyticsData.totalVisits || 0) + 1;

    // Update page visits
    if (!analyticsData.pageVisits) {
      analyticsData.pageVisits = {};
    }
    analyticsData.pageVisits[normalizedPath] = (analyticsData.pageVisits[normalizedPath] || 0) + 1;

    // Update visits by date
    const today = new Date().toISOString().split('T')[0];
    if (!analyticsData.visitsByDate) {
      analyticsData.visitsByDate = [];
    }

    const todayEntry = analyticsData.visitsByDate.find((entry) => entry.date === today);
    if (todayEntry) {
      todayEntry.visits = (todayEntry.visits || 0) + 1;
    } else {
      analyticsData.visitsByDate.push({ date: today, visits: 1 });
      // Keep only last 365 days
      analyticsData.visitsByDate = analyticsData.visitsByDate
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 365);
    }

    // Update top pages (top 10)
    analyticsData.topPages = Object.entries(analyticsData.pageVisits)
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Commit to GitHub
    await updateJSON(
      'data/analytics.json',
      analyticsData,
      `Analytics: Track visit to ${normalizedPath}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Return success even on error to not interrupt user experience
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

