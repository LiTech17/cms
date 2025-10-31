// /app/analytics/page.tsx

import { fetchJsonServer } from '@/lib/json-server';
import AnalyticsClient from '@/components/analytics-client';
import { Metadata } from 'next';

interface AnalyticsData {
  totalVisits: number;
  pageVisits: Record<string, number>;
  visitsByDate: Array<{ date: string; visits: number }>;
  topPages: Array<{ path: string; visits: number }>;
}

export const metadata: Metadata = {
  title: 'Site Analytics - CAPDIMW.org',
  description: 'View site analytics and visitor statistics.',
};

export default async function AnalyticsPage() {
  const analyticsData = await fetchJsonServer<AnalyticsData>('analytics.json');

  if (!analyticsData) {
    return (
      <div className="container mx-auto py-20 text-center dark:bg-gray-950 dark:text-gray-50">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
          Configuration Error
        </h1>
        <div className="mt-4">
          Could not load analytics data from <code>/data/analytics.json</code>. Please ensure the file exists and is valid JSON.
        </div>
      </div>
    );
  }

  return <AnalyticsClient initialData={analyticsData} />;
}

