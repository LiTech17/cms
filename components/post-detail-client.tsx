// /components/post-detail-client.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { Post, PostsData } from '@/lib/types';
import { EditorControls } from './editor-controls';
import { commitJsonChange } from '@/lib/github';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PostDetailClientProps {
  initialPost: Post;
}

const PostDetailClient: React.FC<PostDetailClientProps> = ({ initialPost }) => {
  const router = useRouter();
  const [post, setPost] = useState<Post>(initialPost);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [originalPost, setOriginalPost] = useState<Post>(initialPost);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  const updatePost = useCallback((field: string, value: any) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  }, []);

  const startEdit = useCallback((sectionId: string) => {
    setOriginalPost(post);
    setIsEditing((prev) => ({ ...prev, [sectionId]: true }));
  }, [post]);

  const cancelEdit = useCallback((sectionId: string) => {
    setPost(originalPost);
    setIsEditing((prev) => ({ ...prev, [sectionId]: false }));
  }, [originalPost]);

  const savePost = useCallback(async (sectionId: string) => {
    // Fetch the full posts.json, update the specific post, then save
    try {
      const response = await fetch('/api/json/posts.json');
      const postsData: PostsData = await response.json();

      // Find and update the post
      const updatedPosts = postsData.posts.map((p) =>
        p.slug === post.slug ? { ...post } : p
      );

      const updatedData = {
        ...postsData,
        posts: updatedPosts,
      };

      await commitJsonChange('data/posts.json', updatedData, `Updated post: ${post.title}`);
      setIsEditing((prev) => ({ ...prev, [sectionId]: false }));
      setOriginalPost(post);
      router.refresh(); // Refresh to get updated content from markdown if needed
    } catch (error) {
      console.error('Failed to save post:', error);
      throw error; // Let EditorControls handle the toast
    }
  }, [post, router]);

  const EditableText: React.FC<{ field: string; value: string; className?: string }> = ({
    field, value, className = ''
  }) => {
    if (!isEditing[field]) return <>{value}</>;
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updatePost(field, e.target.value)}
        className={`w-full border border-input rounded-lg p-3 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none ${className}`}
      />
    );
  };

  const EditableTextArea: React.FC<{ field: string; value: string; rows?: number }> = ({
    field, value, rows = 10
  }) => {
    if (!isEditing[field]) {
      // Render markdown-style content as plain text (can be enhanced with markdown parser)
      return (
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {value || 'No content available. Click Edit to add content.'}
          </div>
        </div>
      );
    }
    return (
      <textarea
        value={value || ''}
        rows={rows}
        onChange={(e) => updatePost(field, e.target.value)}
        className="w-full border border-input rounded-lg p-4 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none font-mono text-sm"
        placeholder="Enter post content (supports markdown)"
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
    <article className="flex flex-col gap-12 py-12 md:py-20">
      {/* Back Button */}
      <div className="container mx-auto px-4">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Posts</span>
        </Link>
      </div>

      {/* Hero Section with Image */}
      <EditorControls
        sectionId="image"
        isEditing={isEditing.image || false}
        onStartEdit={() => startEdit('image')}
        onCancel={() => cancelEdit('image')}
        onSave={() => savePost('image')}
      >
        <section className="relative h-96 w-full overflow-hidden bg-gray-100">
          <Image
            src={post.image || '/uploads/logo.png'}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-90"
            priority
          />
          {isEditing.image && (
            <button
              onClick={() => setIsImagePickerOpen(true)}
              className="absolute top-4 right-4 z-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
              type="button"
            >
              Change Image
            </button>
          )}
          <div className="absolute inset-0 bg-primary/70 flex items-end">
          <div className="container mx-auto px-4 pb-8 text-white">
            <EditorControls
              sectionId="title"
              isEditing={isEditing.title || false}
              onStartEdit={() => startEdit('title')}
              onCancel={() => cancelEdit('title')}
              onSave={() => savePost('title')}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-4">
                <EditableText field="title" value={post.title} className="text-white placeholder:text-white/70" />
              </h1>
            </EditorControls>
          </div>
        </div>
      </section>
      </EditorControls>
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={(newImage) => {
          updatePost('image', newImage);
          setIsImagePickerOpen(false);
        }}
        currentImage={post.image}
      />

      {/* Post Meta Information */}
      <section className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-6 border-b border-border">
          <EditorControls
            sectionId="meta"
            isEditing={isEditing.meta || false}
            onStartEdit={() => startEdit('meta')}
            onCancel={() => cancelEdit('meta')}
            onSave={() => savePost('meta')}
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className={isEditing.meta ? 'hidden' : ''}>{formatDate(post.date)}</span>
                {isEditing.meta && (
                  <input
                    type="date"
                    value={post.date}
                    onChange={(e) => updatePost('date', e.target.value)}
                    className="border border-input rounded-lg p-2 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {isEditing.meta ? (
                  <input
                    type="text"
                    value={post.author}
                    onChange={(e) => updatePost('author', e.target.value)}
                    className="border border-input rounded-lg p-2 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                ) : (
                  <span>{post.author}</span>
                )}
              </div>
            </div>
          </EditorControls>
        </div>

        {/* Excerpt */}
        <EditorControls
          sectionId="excerpt"
          isEditing={isEditing.excerpt || false}
          onStartEdit={() => startEdit('excerpt')}
          onCancel={() => cancelEdit('excerpt')}
          onSave={() => savePost('excerpt')}
        >
          <div className="mb-8">
            {isEditing.excerpt ? (
              <textarea
                value={post.excerpt}
                rows={3}
                onChange={(e) => updatePost('excerpt', e.target.value)}
                className="w-full border border-input rounded-lg p-3 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-lg italic"
                placeholder="Post excerpt..."
              />
            ) : (
              <p className="text-xl text-muted-foreground italic leading-relaxed">{post.excerpt}</p>
            )}
          </div>
        </EditorControls>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 max-w-4xl">
        <EditorControls
          sectionId="content"
          isEditing={isEditing.content || false}
          onStartEdit={() => startEdit('content')}
          onCancel={() => cancelEdit('content')}
          onSave={() => savePost('content')}
        >
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <EditableTextArea
              field="content"
              value={post.content || ''}
              rows={20}
            />
          </div>
        </EditorControls>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4">
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">Support Our Work</h3>
          <p className="text-muted-foreground mb-6">
            Your donation helps us continue our vital work promoting inclusiveness and sustainable rights.
          </p>
          <Link
            href="/donate"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Donate Now
          </Link>
        </div>
      </section>
    </article>
  );
};

export default PostDetailClient;

