// /app/posts/[slug]/page.tsx

import { promises as fs } from 'fs';
import path from 'path';
import { PostsData, Post } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PostDetailClient from '@/components/post-detail-client';

// --- Data Fetching Functions ---

async function getPostsData(): Promise<PostsData> {
  const filePath = path.join(process.cwd(), 'data', 'posts.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error fetching posts data:', error);
    return { title: 'Posts', posts: [] };
  }
}

async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const postsData = await getPostsData();
  const post = postsData.posts.find(p => p.slug === slug);

  if (!post) {
    return undefined;
  }

  // Try to read markdown content if contentPath exists
  if (post.contentPath && post.contentPath.startsWith('/data/posts/')) {
    try {
      const contentFilePath = path.join(process.cwd(), post.contentPath);
      const content = await fs.readFile(contentFilePath, 'utf8');
      post.content = content;
    } catch (error) {
      // If markdown file doesn't exist, content remains undefined
      console.warn(`Could not read content from ${post.contentPath}:`, error);
    }
  }

  return post;
}

// --- Next.js Functions ---

export async function generateStaticParams() {
  const postsData = await getPostsData();
  
  return postsData.posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const title = `${post.title} | CAPDIMW Posts`;
  const description = post.excerpt.substring(0, 160);

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [{ url: post.image }],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

// --- Main Page Component ---

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <PostDetailClient initialPost={post} />;
}

