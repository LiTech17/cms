// /components/posts-page-client.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { PostsData, Post } from '@/lib/types';
import { EditorControls } from './editor-controls';
import { commitJsonChange } from '@/lib/github';
import { useAuth } from './auth-provider';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Calendar, User, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PostsPageClientProps {
  initialData: PostsData;
}

const PostsPageClient: React.FC<PostsPageClientProps> = ({ initialData }) => {
  const { isAuth } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<PostsData>(initialData);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [originalContent, setOriginalContent] = useState<PostsData>(initialData);

  const updateContent = useCallback((path: string, value: any) => {
    const keys = path.split('.');
    setContent((prev) => {
      const newContent = { ...prev };
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (Array.isArray(current) && !isNaN(parseInt(key))) {
          if (!current[parseInt(key)]) {
            current[parseInt(key)] = {};
          }
          current = current[parseInt(key)];
        } else {
          if (typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
          }
          current = current[key];
        }
      }

      const lastKey = keys[keys.length - 1];
      if (Array.isArray(current) && !isNaN(parseInt(lastKey))) {
        current[parseInt(lastKey)] = value;
      } else {
        current[lastKey] = value;
      }

      return newContent;
    });
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
    const commitMessage = `Update content for ${sectionId} section on Posts Page`;
    await commitJsonChange('data/posts.json', content, commitMessage);
    setIsEditing((prev) => ({ ...prev, [sectionId]: false }));
    setOriginalContent(content);
  }, [content]);

  const handleAddNewPost = () => {
    // Navigate to a new post creation page or open a modal
    // For now, we'll add a new post with a default structure
    const newPost: Post = {
      slug: `new-post-${Date.now()}`,
      title: 'New Post',
      date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      excerpt: 'Add your post excerpt here...',
      image: '/uploads/logo.png',
      contentPath: `/data/posts/new-post-${Date.now()}.md`,
    };

    setContent((prev) => ({
      ...prev,
      posts: [...prev.posts, newPost],
    }));

    // Auto-save the new post
    setTimeout(async () => {
      await commitJsonChange('data/posts.json', { ...content, posts: [...content.posts, newPost] }, 'Added new post');
      router.push(`/posts/${newPost.slug}`);
    }, 100);
  };

  const EditableText: React.FC<{ section: string; index?: number; field: string; value: string }> = ({
    section, index, field, value
  }) => {
    const sectionKey = index !== undefined ? `${section}-${index}` : section;
    if (!isEditing[sectionKey]) return <>{value}</>;
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (index !== undefined) {
            updateContent(`${section}.${index}.${field}`, e.target.value);
          } else {
            updateContent(`${section}.${field}`, e.target.value);
          }
        }}
        className="w-full border border-input rounded-lg p-2 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  const EditableTextArea: React.FC<{ section: string; index: number; field: string; value: string }> = ({
    section, index, field, value
  }) => {
    const sectionKey = `${section}-${index}`;
    if (!isEditing[sectionKey]) return <div className="text-muted-foreground">{value}</div>;
    return (
      <textarea
        value={value}
        rows={3}
        onChange={(e) => updateContent(`${section}.${index}.${field}`, e.target.value)}
        className="w-full border border-input rounded-lg p-2 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col gap-12 py-12 md:py-20">
      {/* Header Section */}
      <section className="text-center">
        <EditorControls
          sectionId="header"
          isEditing={isEditing.header || false}
          onStartEdit={() => startEdit('header')}
          onCancel={() => cancelEdit('header')}
          onSave={() => saveContent('header')}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
              <EditableText section="header" field="title" value={content.title} />
            </h1>
          </div>
        </EditorControls>

        {/* Add New Post Button (visible when authenticated) */}
        {isAuth && (
          <div className="mt-8">
            <button
              onClick={handleAddNewPost}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add New Post
            </button>
          </div>
        )}
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4">
        {content.posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No posts available yet.</p>
            {isAuth && (
              <button
                onClick={handleAddNewPost}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Post
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.posts.map((post, index) => (
              <EditorControls
                key={post.slug}
                sectionId={`post-${index}`}
                isEditing={isEditing[`post-${index}`] || false}
                onStartEdit={() => startEdit(`post-${index}`)}
                onCancel={() => cancelEdit(`post-${index}`)}
                onSave={() => saveContent(`post-${index}`)}
              >
                <Link
                  href={`/posts/${post.slug}`}
                  className="block h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-border group"
                >
                  {/* Image */}
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={post.image || '/uploads/logo.png'}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {isEditing[`post-${index}`] ? (
                        <EditableText section="posts" index={index} field="title" value={post.title} />
                      ) : (
                        post.title
                      )}
                    </h2>

                    <p className="text-muted-foreground line-clamp-3">
                      {isEditing[`post-${index}`] ? (
                        <EditableTextArea section="posts" index={index} field="excerpt" value={post.excerpt} />
                      ) : (
                        post.excerpt
                      )}
                    </p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </EditorControls>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PostsPageClient;

