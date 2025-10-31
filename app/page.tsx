import { HomeData } from '@/lib/types';
import { fetchJsonServer } from '@/lib/json-server';
import HomePageClient from '@/components/home-page-client';

export const metadata = {
  title: 'CAPDIMW.org - Sustainable Citizen Rights',
  description:
    'Creating a free socially excluded living environment to advance sustainable citizen rights in Malawi.',
};

export default async function HomePage() {
  const homeData = await fetchJsonServer<HomeData>('home.json');

  if (!homeData) {
    return (
      <div className="container mx-auto py-20 text-center dark:bg-gray-950 dark:text-gray-50">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
          Configuration Error
        </h1>
        <div className="mt-4">
          Could not load initial data from <code>/data/home.json</code>. Please ensure the file exists and is valid JSON.
        </div>
      </div>
    );
  }

  return <HomePageClient initialData={homeData} />;
}
