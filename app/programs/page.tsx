// /app/programs/page.tsx

import { ProgramData } from '@/lib/types';
import { fetchJsonServer } from '@/lib/json-server';
import ProgramsPageClient from '@/components/programs-page-client';

export const metadata = {
  title: 'Our Programmes - CAPDIMW.org',
  description:
    'Explore the core programs of CAPDIMW, focusing on economic empowerment, human rights, and environmental protection in socially excluded communities.',
};

export default async function ProgramsPage() {
  const programsData = await fetchJsonServer<ProgramData>('programs.json');

  if (!programsData) {
    return (
      <div className="container mx-auto py-20 text-center dark:bg-gray-950 dark:text-gray-50">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
          Configuration Error
        </h1>
        <div className="mt-4">
          Could not load initial data from <code>/data/programs.json</code>. Please ensure the file exists and is valid JSON.
        </div>
      </div>
    );
  }

  return <ProgramsPageClient initialData={programsData} />;
}