'use client';

import React, { useState, useCallback } from 'react';
import { ProgramData } from '@/lib/types';
import { EditorControls } from './editor-controls';
import ImagePickerModal from './image-picker-modal';
import Image from 'next/image';
import Link from 'next/link';
import { commitJsonChange } from '@/lib/github';
import { Activity, Target } from 'lucide-react';

// --- Simple Card wrapper for shadcn/ui ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`
      p-6 sm:p-8 rounded-2xl shadow-lg transition-shadow duration-200
      bg-card text-card-foreground border
      dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
      ${className}
    `}
  >
    {children}
  </div>
);

interface ProgramsPageClientProps {
  initialData: ProgramData;
}

const ProgramsPageClient: React.FC<ProgramsPageClientProps> = ({ initialData }) => {
  const [content, setContent] = useState<ProgramData>(initialData);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [originalContent, setOriginalContent] = useState<ProgramData>(initialData);
  const [imagePickerOpen, setImagePickerOpen] = useState<{ section: string; index?: number } | null>(null);

  // Update deeply nested content
  const updateContent = useCallback((path: string, value: any) => {
    const parts = path.split('.');
    const [section, indexStr, ...rest] = parts;

    if (section === 'hero') {
      setContent((prev) => ({ ...prev, hero: { ...prev.hero, [indexStr]: value } }));
      return;
    }

    if (section === 'programs' && indexStr !== undefined) {
      const index = parseInt(indexStr);
      const fieldPath = rest.join('.');

      setContent((prev) => ({
        ...prev,
        programs: prev.programs.map((program, i) => {
          if (i === index) {
            let newProgram = { ...program };

            if (fieldPath.includes('.')) {
              const [detailKey, nestedKeyStr] = fieldPath.split('.');
              if (detailKey === 'details' && newProgram.details) {
                if (nestedKeyStr.includes('.')) {
                  const [nestedArrayKey, nestedIndexStr] = nestedKeyStr.split('.');
                  const nestedIndex = parseInt(nestedIndexStr);
                  (newProgram.details as any)[nestedArrayKey] = (newProgram.details as any)[nestedArrayKey].map(
                    (item: any, idx: number) => (idx === nestedIndex ? value : item)
                  );
                } else {
                  newProgram.details = { ...newProgram.details, [nestedKeyStr]: value };
                }
              }
            } else {
              (newProgram as any)[fieldPath] = value;
            }

            return newProgram;
          }
          return program;
        }),
      }));
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
    const commitMessage = `Update content for ${sectionId} on Programs Page`;
    await commitJsonChange('programs.json', content, commitMessage);
    setIsEditing((prev) => ({ ...prev, [sectionId]: false }));
    setOriginalContent(content);
  }, [content]);

  // Editable text input
  const EditableText: React.FC<{ sectionId: string; field: string; value: string; className?: string }> = ({
    sectionId,
    field,
    value,
    className = '',
  }) => {
    if (!isEditing[sectionId]) return <>{value}</>;
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateContent(field, e.target.value)}
        className={`w-full border border-input rounded-lg p-2 bg-background dark:bg-gray-900 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary focus:outline-none ${className}`}
      />
    );
  };

  // Editable text area
  const EditableTextArea: React.FC<{ sectionId: string; field: string; value: string; rows?: number }> = ({
    sectionId,
    field,
    value,
    rows = 3,
  }) => {
    if (!isEditing[sectionId])
      return <div className="text-muted-foreground dark:text-gray-300 leading-relaxed">{value}</div>;
    return (
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => updateContent(field, e.target.value)}
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
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-primary dark:text-primary-light">
                <EditableText sectionId="hero" field="hero.heading" value={content.hero.heading} className="text-center" />
              </h1>
              <div className="text-lg sm:text-xl text-muted-foreground dark:text-gray-300 leading-relaxed">
                <EditableTextArea sectionId="hero" field="hero.text" value={content.hero.text} rows={3} />
              </div>
            </div>
          </EditorControls>
        </div>
      </section>

      {/* PROGRAMS LIST */}
      <section className="py-16 sm:py-24 bg-muted/30 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-foreground dark:text-gray-50">
            Our Core Programmes
          </h2>

          <div className="grid md:grid-cols-2 gap-10 sm:gap-12 lg:gap-16">
            {content.programs.map((program, idx) => (
              <Card key={program.id} className="p-0 overflow-hidden group">
                <EditorControls
                  sectionId={`program-${program.id}`}
                  isEditing={isEditing[`program-${program.id}`] || false}
                  onStartEdit={() => startEdit(`program-${program.id}`)}
                  onCancel={() => cancelEdit(`program-${program.id}`)}
                  onSave={() => saveContent('programs')}
                >
                  <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
                    {/* Image */}
                    <div className="relative w-full sm:w-1/3 h-40 sm:h-auto rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      {isEditing[`program-${program.id}`] && (
                        <button
                          onClick={() => setImagePickerOpen({ section: 'programs', index: idx })}
                          className="absolute top-2 right-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors text-sm font-medium z-10"
                          type="button"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="w-full sm:w-2/3 space-y-3">
                      <h3 className="text-2xl font-bold text-foreground dark:text-gray-50">
                        <EditableText
                          sectionId={`program-${program.id}`}
                          field={`programs.${idx}.title`}
                          value={program.title}
                        />
                      </h3>
                      <div className="text-muted-foreground dark:text-gray-300">
                        <EditableTextArea
                          sectionId={`program-${program.id}`}
                          field={`programs.${idx}.shortDescription`}
                          value={program.shortDescription}
                          rows={2}
                        />
                      </div>
                      <Link
                        href={`/programs/${program.id}`}
                        className="inline-flex items-center text-primary dark:text-primary-light font-medium hover:underline mt-2"
                      >
                        View Details &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Full details editing */}
                  {isEditing[`program-${program.id}`] && (
                    <div className="p-6 pt-0 sm:p-8 sm:pt-0 space-y-6">
                      <div className="font-semibold text-lg text-primary">Full Details:</div>

                      <h4 className="text-xl font-semibold">Details Heading</h4>
                      <EditableText
                        sectionId={`program-${program.id}`}
                        field={`programs.${idx}.details.heading`}
                        value={program.details.heading}
                      />

                      <h4 className="text-xl font-semibold">Details Text</h4>
                      <EditableTextArea
                        sectionId={`program-${program.id}`}
                        field={`programs.${idx}.details.text`}
                        value={program.details.text}
                        rows={5}
                      />

                      <h4 className="text-xl font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4" /> Objectives
                      </h4>
                      <ul className="space-y-2">
                        {program.details.objectives.map((obj, objIdx) => (
                          <li key={objIdx}>
                            <EditableText
                              sectionId={`program-${program.id}`}
                              field={`programs.${idx}.details.objectives.${objIdx}`}
                              value={obj}
                              className="p-1 border-b"
                            />
                          </li>
                        ))}
                      </ul>

                      <h4 className="text-xl font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Focus Areas
                      </h4>
                      <ul className="space-y-2">
                        {program.details.focusAreas.map((area, areaIdx) => (
                          <li key={areaIdx}>
                            <EditableText
                              sectionId={`program-${program.id}`}
                              field={`programs.${idx}.details.focusAreas.${areaIdx}`}
                              value={area}
                              className="p-1 border-b"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </EditorControls>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Image Picker Modal */}
      {imagePickerOpen && (
        <ImagePickerModal
          isOpen={true}
          onClose={() => setImagePickerOpen(null)}
          onSelect={(newImage) => {
            if (imagePickerOpen.section === 'programs' && imagePickerOpen.index !== undefined) {
              updateContent(`programs.${imagePickerOpen.index}.image`, newImage);
            }
            setImagePickerOpen(null);
          }}
          currentImage={
            imagePickerOpen.section === 'programs' && imagePickerOpen.index !== undefined
              ? content.programs[imagePickerOpen.index]?.image
              : undefined
          }
        />
      )}
    </div>
  );
};

export default ProgramsPageClient;
