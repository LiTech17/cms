'use client';

import React, { useState, useCallback } from 'react';
import { HomeData } from '@/lib/types';
import { EditorControls } from './editor-controls';
import ImageCarousel from './carousel';
import Image from 'next/image';
import Link from 'next/link';
import { commitJsonChange } from '@/lib/github';

// --- UI mocks for shadcn/ui ---
const Card = ({ children, className = '' }: any) => (
  <div
    className={`
      p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200
      bg-card text-card-foreground
      dark:bg-gray-800 dark:text-gray-100
      ${className}
    `}
  >
    {children}
  </div>
);

const CardHeader = ({ children }: any) => (
  <div className="font-semibold text-lg sm:text-xl mb-3 text-foreground dark:text-gray-50">
    {children}
  </div>
);

const CardContent = ({ children }: any) => (
  <div className="space-y-3 text-muted-foreground dark:text-gray-300">{children}</div>
);

interface HomePageClientProps {
  initialData: HomeData;
}

const HomePageClient: React.FC<HomePageClientProps> = ({ initialData }) => {
  const [content, setContent] = useState<HomeData>(initialData);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [originalContent, setOriginalContent] = useState<HomeData>(initialData);

  const updateContent = useCallback((path: string, value: any) => {
    if (path.includes('.')) {
      const [section, key] = path.split('.');
      setContent((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof HomeData],
          [key]: value,
        },
      }));
    } else {
      setContent((prev) => ({ ...prev, [path]: value }));
    }
  }, []);

  const startEdit = useCallback((sectionId: string) => {
    setOriginalContent(content);
    setIsEditing((prev) => ({ ...prev, [sectionId]: true }));
  }, [content]);

  const cancelEdit = useCallback((sectionId: string) => {
    setContent(originalContent);
    setIsEditing((prev) => ({ ...prev, [sectionId]: false }));
  }, [originalContent]);

  const saveContent = useCallback(async (sectionId: string) => {
    const commitMessage = `Update content for ${sectionId} section on Home Page`;
    await commitJsonChange('home.json', content, commitMessage);
    setIsEditing((prev) => ({ ...prev, [sectionId]: false }));
    setOriginalContent(content);
  }, [content]);

  const EditableText: React.FC<{ section: keyof HomeData; field: string; value: string }> = ({
    section, field, value
  }) => {
    if (!isEditing[section]) return <>{value}</>;
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateContent(`${section}.${field}`, e.target.value)}
        className="w-full border border-input rounded-lg p-3 sm:p-4 bg-background dark:bg-gray-900 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  const EditableTextArea: React.FC<{ section: keyof HomeData; field: string; value: string }> = ({
    section, field, value
  }) => {
    if (!isEditing[section]) return <div className="text-muted-foreground dark:text-gray-300 leading-relaxed">{value}</div>;
    return (
      <textarea
        value={value}
        rows={3}
        onChange={(e) => updateContent(`${section}.${field}`, e.target.value)}
        className="w-full border border-input rounded-lg p-3 sm:p-4 bg-background dark:bg-gray-900 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 bg-background dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <EditorControls
            sectionId="hero"
            isEditing={isEditing.hero || false}
            onStartEdit={() => startEdit('hero')}
            onCancel={() => cancelEdit('hero')}
            onSave={() => saveContent('hero')}
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground dark:text-gray-50 leading-tight">
                  <EditableText section="hero" field="heading" value={content.hero.heading} />
                </h1>
                <div className="text-lg sm:text-xl text-muted-foreground dark:text-gray-300 leading-relaxed">
                  <EditableTextArea section="hero" field="text" value={content.hero.text} />
                </div>
                <Link href="/donate">
                  <button className="inline-flex items-center justify-center rounded-xl text-sm sm:text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 mt-2 sm:mt-4 transition-all shadow-md hover:shadow-xl">
                    Donate Now
                  </button>
                </Link>
              </div>
              <div className="relative mt-10 md:mt-0">
                <ImageCarousel images={content.hero.gallery} altText="CAPDIMW Hero Images" aspectRatioClass="aspect-[16/10]" />
              </div>
            </div>
          </EditorControls>
        </div>
      </section>

      {/* GRID SECTIONS */}
      <section className="bg-muted/30 dark:bg-gray-900 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-foreground dark:text-gray-50">
            Our Mission & Structure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {content.gridSections.map((section, idx) => (
              <Card key={section.id}>
                <EditorControls
                  sectionId={`grid-${section.id}`}
                  isEditing={isEditing[`grid-${section.id}`] || false}
                  onStartEdit={() => startEdit(`grid-${section.id}`)}
                  onCancel={() => cancelEdit(`grid-${section.id}`)}
                  onSave={() => saveContent('gridSections')}
                >
                  <CardHeader>
                    <EditableText section="gridSections" field={`${idx}.title`} value={section.title} />
                  </CardHeader>
                  <CardContent>
                    {section.vision && <div className="font-medium text-primary dark:text-primary-light">Vision:</div>}
                    {section.vision && <EditableTextArea section="gridSections" field={`${idx}.vision`} value={section.vision} />}
                    {section.mission && <div className="font-medium text-primary dark:text-primary-light pt-2">Mission:</div>}
                    {section.mission && <EditableTextArea section="gridSections" field={`${idx}.mission`} value={section.mission} />}
                    {section.text && <EditableTextArea section="gridSections" field={`${idx}.text`} value={section.text} />}
                    {section.items && (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground dark:text-gray-400">
                        {section.items.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    )}
                  </CardContent>
                </EditorControls>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* POSTS */}
      <section className="py-16 sm:py-24 bg-background dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-foreground dark:text-gray-50">
            Key Program Details
          </h2>
          <div className="space-y-10 sm:space-y-16">
            {content.posts.map((post, idx) => (
              <EditorControls
                key={post.id}
                sectionId={`post-${post.id}`}
                isEditing={isEditing[`post-${post.id}`] || false}
                onStartEdit={() => startEdit(`post-${post.id}`)}
                onCancel={() => cancelEdit(`post-${post.id}`)}
                onSave={() => saveContent('posts')}
              >
                <Card className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
                  <div className={`relative w-full lg:w-1/3 ${isEditing[`post-${post.id}`] ? 'order-2 lg:order-1' : 'order-1'}`}>
                    <Image src={post.image} alt={post.title} width={500} height={300} className="rounded-xl object-cover aspect-[4/3] w-full" />
                  </div>
                  <div className={`w-full lg:w-2/3 space-y-4 ${isEditing[`post-${post.id}`] ? 'order-1 lg:order-2' : 'order-2'}`}>
                    <h3 className="text-2xl font-bold text-foreground dark:text-gray-50">
                      <EditableText section="posts" field={`${idx}.title`} value={post.title} />
                    </h3>
                    {post.text && <EditableTextArea section="posts" field={`${idx}.text`} value={post.text} />}
                    {post.objectives && (
                      <ul className="list-disc pl-5 space-y-1 text-primary dark:text-primary-light text-sm sm:text-base">
                        {post.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                      </ul>
                    )}
                    <Link href={`/posts/${post.id}`} className="text-primary dark:text-primary-light font-medium hover:underline flex items-center gap-1 mt-4">
                      Read More
                    </Link>
                  </div>
                </Card>
              </EditorControls>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePageClient;
