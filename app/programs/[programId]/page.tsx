// /app/programs/[programId]/page.tsx

import { promises as fs } from 'fs';
import path from 'path';
import { ProgramData, Program } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata, Viewport } from 'next';
import { Target, Star, Layers, MapPin } from 'lucide-react';

// --- Data Fetching Functions ---

async function getProgramData(): Promise<ProgramData> {
  const filePath = path.join(process.cwd(), 'data', 'programs.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

async function getProgramById(id: string): Promise<Program | undefined> {
  const programData = await getProgramData();
  return programData.programs.find(p => p.id === id);
}

// --- Next.js Functions ---

// 1. generateStaticParams: Tells Next.js which paths to pre-render at build time
export async function generateStaticParams() {
  const programData = await getProgramData();
  
  return programData.programs.map((program) => ({
    programId: program.id,
  }));
}

// 2. generateMetadata: Generates dynamic metadata for each program page
export async function generateMetadata({ params }: { params: Promise<{ programId: string }> }): Promise<Metadata> {
  const { programId } = await params;
  const program = await getProgramById(programId);

  if (!program) {
    return { title: 'Program Not Found' };
  }

  const title = `${program.title} | CAPDIMW Programs`;
  const description = program.details.text.substring(0, 150) + '...';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [{ url: program.image }],
    },
  };
}

// 3. generateViewport: Resolves the Next.js viewport warning
export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#004AAD', // Primary brand color example
  };
}

// --- Main Page Component ---

export default async function ProgramDetailPage({ params }: { params: Promise<{ programId: string }> }) {
  // In Next.js 15, params are now a Promise and must be awaited
  const { programId } = await params;
  const program = await getProgramById(programId);

  if (!program) {
    // If the program ID doesn't exist, show a 404 page
    notFound();
  }

  const { title, details, image } = program;

  return (
    <div className="flex flex-col gap-16 py-12 md:py-20">
      
      {/* 🏞️ Hero and Title */}
      <section className="relative h-[400px] w-full overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-primary/80 flex flex-col items-center justify-center p-8 text-white">
          <h1 className="text-sm uppercase tracking-widest font-semibold opacity-80 mb-2">Our Programmes</h1>
          <h2 className="text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg">{title}</h2>
        </div>
      </section>

      {/* 📜 Program Overview */}
      <section className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <h3 className="text-3xl font-bold text-primary mb-4">{details.heading}</h3>
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{details.text}</p>
          
          {/* Detailed Objectives */}
          <div className="mt-8">
            <h4 className="text-2xl font-semibold text-secondary mb-4 flex items-center"><Target className="w-5 h-5 mr-2" /> Key Objectives</h4>
            <ul className="space-y-3 list-none">
              {details.objectives.map((obj, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <Star className="w-5 h-5 mr-3 mt-1 text-accent flex-shrink-0" />
                  <span className='flex-1'>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* 📋 Focus Areas Sidebar */}
        <aside className="md:col-span-1 bg-blue-50 p-6 rounded-lg shadow-lg h-fit sticky top-24">
          <h4 className="text-xl font-bold text-secondary mb-4 flex items-center"><Layers className="w-5 h-5 mr-2" /> Main Focus Areas</h4>
          <ul className="space-y-4">
            {details.focusAreas.map((area, index) => (
              <li key={index} className="text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-primary flex-shrink-0" />
                {area}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* 📣 Call to Action (Placeholder) */}
      <section className="container mx-auto px-4 text-center">
          <div className="bg-primary/10 p-10 rounded-xl">
              <h3 className="text-3xl font-bold text-primary mb-4">Support This Programme</h3>
              <p className="text-lg text-gray-700 mb-6">Your contribution directly funds initiatives like {title}.</p>
              <a href="/donate" className="inline-block px-8 py-3 bg-accent text-white font-semibold rounded-full hover:bg-accent/90 transition duration-300">
                  Donate Now
              </a>
          </div>
      </section>
    </div>
  );
}