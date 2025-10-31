// /app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './tailwind-output.css'; // <-- use the compiled Tailwind CSS

import { AuthProvider } from '@/components/auth-provider';
import { PublicHeader } from '@/components/public-header';
import { PublicFooter } from '@/components/public-footer';
import { Toaster } from '@/components/toaster';

// ---------------------------------------------------------
// 1. Load Global Font
// ---------------------------------------------------------
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// ---------------------------------------------------------
// 2. SEO Metadata
// ---------------------------------------------------------
export const metadata: Metadata = {
  title: 'CAPDIMW.org – Sustainable Citizen Rights',
  description:
    'Creating a free, socially inclusive living environment to advance sustainable citizen rights in Malawi.',
  keywords: [
    'CAPDIMW',
    'Malawi',
    'sustainability',
    'citizen rights',
    'social inclusion',
    'NGO',
    'human development',
  ],
  authors: [{ name: 'CAPDIMW.org' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: 'CAPDIMW.org – Sustainable Citizen Rights',
    description:
      'Creating a free, socially inclusive living environment to advance sustainable citizen rights in Malawi.',
    url: 'https://capdimw.org',
    siteName: 'CAPDIMW',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@capdimw',
    title: 'CAPDIMW.org – Sustainable Citizen Rights',
    description:
      'Advancing sustainable citizen rights in Malawi through social inclusion and empowerment.',
  },
};

// ---------------------------------------------------------
// 3. Root Layout Component
// ---------------------------------------------------------
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className={`
          flex flex-col min-h-screen
          antialiased
          selection:bg-primary/20 selection:text-primary
          transition-colors duration-300 ease-in-out
          bg-background text-foreground
          dark:bg-background-dark dark:text-foreground-dark
        `}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* --------------- HEADER --------------- */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 dark:bg-background-dark/80 border-b border-border/40">
              <PublicHeader />
            </header>

            {/* --------------- MAIN CONTENT --------------- */}
            <main
              className={`
                flex-grow
                container mx-auto
                px-4 sm:px-6 lg:px-8
                py-10 sm:py-16
                space-y-8
              `}
            >
              {children}
            </main>

            {/* --------------- FOOTER --------------- */}
            <footer className="border-t border-border/40 bg-muted/20 dark:bg-muted-dark/20 mt-auto">
              <PublicFooter />
            </footer>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
