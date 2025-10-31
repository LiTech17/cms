// /app/posts/page.tsx

import { PostsData } from '@/lib/types';
import { fetchJsonServer } from '@/lib/json-server';
import PostsPageClient from '@/components/posts-page-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest News and Updates - CAPDIMW.org',
  description: 'Stay updated with the latest news, events, and updates from CAPDIMW.',
};

export default async function PostsPage() {
  const postsData = await fetchJsonServer<PostsData>('posts.json');

  if (!postsData) {
    return (
      <div className="container mx-auto py-20 text-center dark:bg-gray-950 dark:text-gray-50">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
          Configuration Error
        </h1>
        <div className="mt-4">
          Could not load initial data from <code>/data/posts.json</code>. Please ensure the file exists and is valid JSON.
        </div>
      </div>
    );
  }

  return <PostsPageClient initialData={postsData} />;
}

