// /components/public-header.tsx
import Link from 'next/link';
import Image from 'next/image';
import { HomeData } from '@/lib/types';
import { fetchJsonServer } from '@/lib/json-server'; // <-- server-safe fetch
import { AuthControls } from './public-header-client';

export const PublicHeader = async () => {
  // Server-side JSON read
  const homeData = await fetchJsonServer<HomeData>('home.json');
  const headerContent = homeData?.header;

  if (!headerContent) {
    return (
      <header className="bg-background py-4 text-center border-b border-destructive">
        Content Data Missing. Please check /data/home.json.
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Site Title */}
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
        >
          <Image
            src={headerContent.logo || '/logo-placeholder.png'}
            alt="CAPDIMW Logo"
            width={42}
            height={42}
            className="rounded-full aspect-square object-cover ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all"
            priority
          />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            CAPDIMW<span className="hidden sm:inline">.org</span>
          </span>
        </Link>

        {/* Navigation (Client-side) */}
        <AuthControls navigation={headerContent.navigation} />
      </div>
    </header>
  );
};

export default PublicHeader;
