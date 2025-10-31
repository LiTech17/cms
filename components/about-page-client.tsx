// /components/about-page-client.tsx

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { AboutData } from '@/lib/types';
import { EditorControls } from './editor-controls';
import ImagePickerModal from './image-picker-modal';
import { commitJsonChange } from '@/lib/github';
import { Star, MapPin, Target, Users, BookOpen } from 'lucide-react';

interface AboutPageClientProps {
  data: AboutData;
}

const AboutPageClient: React.FC<AboutPageClientProps> = ({ data }) => {
  const [content, setContent] = useState<AboutData>(data);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [originalContent, setOriginalContent] = useState<AboutData>(data);
  const [imagePickerOpen, setImagePickerOpen] = useState<{ section: string; index?: number } | null>(null);

  const updateContent = useCallback((path: string, value: any) => {
    const keys = path.split('.');
    setContent((prev) => {
      const newContent = { ...prev };
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (typeof current[key] !== 'object' || current[key] === null) {
          current[key] = {};
        }
        current = current[key];
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
    await commitJsonChange('data/about.json', content, `Update ${sectionId} section on About Page`);
    setIsEditing((prev) => ({ ...prev, [sectionId]: false }));
    setOriginalContent(content);
  }, [content]);

  const EditableText: React.FC<{ section: string; field: string; value: string }> = ({ section, field, value }) => {
    if (!isEditing[section]) return <>{value}</>;
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateContent(`${section}.${field}`, e.target.value)}
        className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  const EditableTextArea: React.FC<{ section: string; field: string; value: string }> = ({ section, field, value }) => {
    if (!isEditing[section]) return <div className="text-gray-700 leading-relaxed">{value}</div>;
    return (
      <textarea
        value={value}
        rows={4}
        onChange={(e) => updateContent(`${section}.${field}`, e.target.value)}
        className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  const { hero, history, visionAndMission, programHighlights, team } = content;

  return (
    <div className="flex flex-col gap-16 py-12 md:py-20">
      {/* 🏞️ Hero Section */}
      <EditorControls
        sectionId="hero"
        isEditing={isEditing.hero || false}
        onStartEdit={() => startEdit('hero')}
        onCancel={() => cancelEdit('hero')}
        onSave={() => saveContent('hero')}
      >
        <section className="relative h-96 w-full overflow-hidden bg-gray-100">
          <Image
            src={hero.image}
            alt={hero.heading}
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-70"
          />
          {isEditing.hero && (
            <button
              onClick={() => setImagePickerOpen({ section: 'hero' })}
              className="absolute top-4 right-4 z-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
              type="button"
            >
              Change Image
            </button>
          )}
          <div className="absolute inset-0 bg-primary/70 flex items-center justify-center p-8">
            <div className="text-center text-white max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                <EditableText section="hero" field="heading" value={hero.heading} />
              </h1>
              <p className="text-xl md:text-2xl font-light">
                <EditableTextArea section="hero" field="text" value={hero.text} />
              </p>
            </div>
          </div>
        </section>
      </EditorControls>

      {/* 📜 History & Location Section */}
      <section className="container mx-auto px-4 grid md:grid-cols-3 gap-10">
        <EditorControls
          sectionId="history"
          isEditing={isEditing.history || false}
          onStartEdit={() => startEdit('history')}
          onCancel={() => cancelEdit('history')}
          onSave={() => saveContent('history')}
        >
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-primary mb-4">
              <EditableText section="history" field="title" value={history.title} />
            </h2>
            <EditableTextArea section="history" field="text" value={history.text} />
          </div>
          <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-3 flex items-center text-secondary">
              <MapPin className="w-5 h-5 mr-2" /> Operational Base
            </h3>
            <p className="text-gray-700">
              <EditableText section="history" field="location" value={history.location} />
            </p>
          </div>
        </EditorControls>
      </section>

      {/* ✨ Vision and Mission Section */}
      <section className="container mx-auto px-4">
        <EditorControls
          sectionId="visionAndMission"
          isEditing={isEditing.visionAndMission || false}
          onStartEdit={() => startEdit('visionAndMission')}
          onCancel={() => cancelEdit('visionAndMission')}
          onSave={() => saveContent('visionAndMission')}
        >
          <div className="grid md:grid-cols-2 gap-8 bg-blue-50 p-8 rounded-xl shadow-lg">
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold mb-3 text-secondary flex items-center">
                <Target className="w-6 h-6 mr-2" /> Vision Statement
              </h3>
              <blockquote className="border-l-4 border-secondary pl-4 text-xl italic text-gray-800">
                <EditableTextArea section="visionAndMission" field="vision" value={visionAndMission.vision} />
              </blockquote>
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold mb-3 text-secondary flex items-center">
                <Star className="w-6 h-6 mr-2" /> Mission Statement
              </h3>
              <blockquote className="border-l-4 border-secondary pl-4 text-xl italic text-gray-800">
                <EditableTextArea section="visionAndMission" field="mission" value={visionAndMission.mission} />
              </blockquote>
            </div>
          </div>
        </EditorControls>
      </section>

      {/* 🚀 Program Highlights Section */}
      <section className="container mx-auto px-4">
        <EditorControls
          sectionId="programHighlights"
          isEditing={isEditing.programHighlights || false}
          onStartEdit={() => startEdit('programHighlights')}
          onCancel={() => cancelEdit('programHighlights')}
          onSave={() => saveContent('programHighlights')}
        >
          <h2 className="text-3xl font-bold text-primary mb-6">
            <EditableText section="programHighlights" field="title" value={programHighlights.title} />
          </h2>
          <EditableTextArea section="programHighlights" field="description" value={programHighlights.description} />

          <div className="grid lg:grid-cols-3 gap-10 mt-8">
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-semibold mb-4 flex items-center text-secondary">
                <BookOpen className="w-5 h-5 mr-2" /> Focus Areas
              </h3>
              <ul className="space-y-3 list-disc list-inside text-gray-700">
                {programHighlights.areas.map((area, index) => (
                  <li key={index} className="pl-2">{area}</li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold mb-4 flex items-center text-secondary">
                <Users className="w-5 h-5 mr-2" /> Notable Projects & Impact
              </h3>
              <div className="space-y-6">
                {programHighlights.projects.map((project, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg border-l-4 border-accent shadow-md">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h4>
                    <p className="text-gray-600">{project.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EditorControls>
      </section>

      {/* 👥 Team Section */}
      <section className="container mx-auto px-4 text-center">
        <EditorControls
          sectionId="team"
          isEditing={isEditing.team || false}
          onStartEdit={() => startEdit('team')}
          onCancel={() => cancelEdit('team')}
          onSave={() => saveContent('team')}
        >
          <h2 className="text-3xl font-bold text-primary mb-10">
            <EditableText section="team" field="title" value={team.title} />
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.members.map((member, index) => (
              <div key={member.name || index} className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-secondary">
                  <Image
                    src={member.photo || '/uploads/placeholder-team.jpg'}
                    alt={member.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  {isEditing.team && (
                    <button
                      onClick={() => setImagePickerOpen({ section: 'team', index })}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium hover:bg-black/70 transition-colors"
                      type="button"
                    >
                      Change Photo
                    </button>
                  )}
                </div>
                <h4 className="text-xl font-semibold text-gray-900">{member.name}</h4>
                <p className="text-primary font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </EditorControls>
      </section>

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <ImagePickerModal
          isOpen={true}
          onClose={() => setImagePickerOpen(null)}
          onSelect={(newImage) => {
            if (imagePickerOpen.section === 'hero') {
              updateContent('hero.image', newImage);
            } else if (imagePickerOpen.section === 'team' && imagePickerOpen.index !== undefined) {
              updateContent(`team.members.${imagePickerOpen.index}.photo`, newImage);
            }
            setImagePickerOpen(null);
          }}
          currentImage={
            imagePickerOpen.section === 'hero'
              ? hero.image
              : imagePickerOpen.section === 'team' && imagePickerOpen.index !== undefined
              ? team.members[imagePickerOpen.index]?.photo
              : undefined
          }
        />
      )}
    </div>
  );
};

export default AboutPageClient;
