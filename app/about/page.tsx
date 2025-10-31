// /app/about/page.tsx

import { promises as fs } from 'fs';
import path from 'path';
import AboutPageClient from '@/components/about-page-client';
import { AboutData } from '@/lib/types';

// Define metadata for SEO
export const metadata = {
  title: 'About CAPDIMW - Mission, Vision, and Team',
  description: 'Learn about CAPDIMW\'s mission, vision, history, key programs, and leadership team dedicated to empowering socially excluded groups in Malawi.',
};

// Function to fetch data from the JSON file
async function getAboutData(): Promise<AboutData> {
  const filePath = path.join(process.cwd(), 'data', 'about.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: AboutData = JSON.parse(fileContents);
    return data;
  } catch (error) {
    console.error('Error fetching About data:', error);
    // Return a minimal, safe fallback structure
    return {
      hero: { image: '', heading: 'About Us', text: 'Data failed to load.' },
      history: { title: 'History', text: 'Loading error.', location: '' },
      visionAndMission: { vision: 'Loading error.', mission: 'Loading error.' },
      programHighlights: { title: 'Programs', description: 'Loading error.', areas: [], projects: [] },
      team: { title: 'Team', members: [] },
    } as AboutData;
  }
}

export default async function AboutPage() {
  const aboutData = await getAboutData();

  return (
    // Pass the fetched data to the client component
    <AboutPageClient data={aboutData} />
  );
}