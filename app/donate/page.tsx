// /app/donate/page.tsx

import { DonateData } from '@/lib/types';
import { fetchJsonServer } from '@/lib/json-server';
import DonatePageClient from '@/components/donate-page-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donate - Support CAPDIMW.org',
  description: 'Support our work promoting inclusiveness and sustainable rights for socially excluded groups in Malawi.',
};

export default async function DonatePage() {
  const donateData = await fetchJsonServer<DonateData>('donate.json');

  if (!donateData) {
    return (
      <div className="container mx-auto py-20 text-center dark:bg-gray-950 dark:text-gray-50">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
          Configuration Error
        </h1>
        <div className="mt-4">
          Could not load initial data from <code>/data/donate.json</code>. Please ensure the file exists and is valid JSON.
        </div>
      </div>
    );
  }

  return <DonatePageClient initialData={donateData} />;
}

