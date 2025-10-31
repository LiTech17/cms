// /components/donate-page-client.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { DonateData } from '@/lib/types';
import { EditorControls } from './editor-controls';
import { commitJsonChange } from '@/lib/github';
import { Heart, CreditCard, Building2, DollarSign } from 'lucide-react';

interface DonatePageClientProps {
  initialData: DonateData;
}

const DonatePageClient: React.FC<DonatePageClientProps> = ({ initialData }) => {
  const [content, setContent] = useState<DonateData>(initialData);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [originalContent, setOriginalContent] = useState<DonateData>(initialData);

  const updateContent = useCallback((path: string, value: any) => {
    const keys = path.split('.');
    setContent((prev) => {
      const newContent = { ...prev };
      let current: any = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (typeof current[keys[i]] !== 'object' || current[keys[i]] === null) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
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
    const commitMessage = `Update content for ${sectionId} section on Donate Page`;
    await commitJsonChange('data/donate.json', content, commitMessage);
    setIsEditing((prev) => ({ ...prev, [sectionId]: false }));
    setOriginalContent(content);
  }, [content]);

  const EditableText: React.FC<{ section: string; field: string; value: string }> = ({
    section, field, value
  }) => {
    if (!isEditing[section]) return <>{value}</>;
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateContent(`${section}.${field}`, e.target.value)}
        className="w-full border border-input rounded-lg p-3 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  const EditableTextArea: React.FC<{ section: string; field: string; value: string }> = ({
    section, field, value
  }) => {
    if (!isEditing[section]) return <div className="text-muted-foreground leading-relaxed">{value}</div>;
    return (
      <textarea
        value={value}
        rows={4}
        onChange={(e) => updateContent(`${section}.${field}`, e.target.value)}
        className="w-full border border-input rounded-lg p-3 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  const EditableNumber: React.FC<{ section: string; index: number; field: string; value: number }> = ({
    section, index, field, value
  }) => {
    if (!isEditing[section]) return <>{value}</>;
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => updateContent(`${section}.${index}.${field}`, parseFloat(e.target.value) || 0)}
        className="w-full border border-input rounded-lg p-2 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  const EditableOptionText: React.FC<{ section: string; index: number; field: string; value: string }> = ({
    section, index, field, value
  }) => {
    if (!isEditing[section]) return <>{value}</>;
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateContent(`${section}.${index}.${field}`, e.target.value)}
        className="w-full border border-input rounded-lg p-2 bg-background dark:bg-gray-900 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      />
    );
  };

  return (
    <div className="flex flex-col gap-16 py-12 md:py-20">
      {/* Hero Section */}
      <section className="text-center">
        <EditorControls
          sectionId="hero"
          isEditing={isEditing.hero || false}
          onStartEdit={() => startEdit('hero')}
          onCancel={() => cancelEdit('hero')}
          onSave={() => saveContent('hero')}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary">
              <EditableText section="hero" field="title" value={content.title} />
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
              <EditableTextArea section="hero" field="mainText" value={content.mainText} />
            </p>
          </div>
        </EditorControls>
      </section>

      {/* Donation Options */}
      <section className="container mx-auto px-4">
        <EditorControls
          sectionId="donationOptions"
          isEditing={isEditing.donationOptions || false}
          onStartEdit={() => startEdit('donationOptions')}
          onCancel={() => cancelEdit('donationOptions')}
          onSave={() => saveContent('donationOptions')}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4 text-center">Donation Options</h2>
            <p className="text-center text-muted-foreground mb-8">Choose an amount to support our work</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {content.donationOptions.map((option, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-border hover:shadow-xl transition-shadow"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">
                      ${isEditing.donationOptions ? (
                        <EditableNumber section="donationOptions" index={index} field="amount" value={option.amount} />
                      ) : (
                        option.amount
                      )}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {isEditing.donationOptions ? (
                      <EditableOptionText section="donationOptions" index={index} field="description" value={option.description} />
                    ) : (
                      option.description
                    )}
                  </p>
                  <button className="mt-6 w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Donate ${option.amount}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </EditorControls>
      </section>

      {/* Bank Details */}
      <section className="container mx-auto px-4">
        <EditorControls
          sectionId="bankDetails"
          isEditing={isEditing.bankDetails || false}
          onStartEdit={() => startEdit('bankDetails')}
          onCancel={() => cancelEdit('bankDetails')}
          onSave={() => saveContent('bankDetails')}
        >
          <div className="bg-muted/30 dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-primary">Bank Transfer Details</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Bank Name</label>
                  <div className="p-4 bg-background dark:bg-gray-900 rounded-lg border border-border">
                    <EditableText section="bankDetails" field="bankName" value={content.bankDetails.bankName} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Account Name</label>
                  <div className="p-4 bg-background dark:bg-gray-900 rounded-lg border border-border">
                    <EditableText section="bankDetails" field="accountName" value={content.bankDetails.accountName} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Account Number</label>
                <div className="p-4 bg-background dark:bg-gray-900 rounded-lg border border-border">
                  <EditableText section="bankDetails" field="accountNumber" value={content.bankDetails.accountNumber} />
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Please include your name or reference when making a bank transfer so we can acknowledge your contribution.
              </p>
            </div>
          </div>
        </EditorControls>
      </section>

      {/* Additional Info */}
      <section className="container mx-auto px-4 text-center">
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-primary mb-4">Other Ways to Support</h3>
          <p className="text-muted-foreground mb-6">
            If you prefer to donate through other methods or have questions about donations, please contact us.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/about"
              className="px-6 py-3 bg-background dark:bg-gray-800 text-foreground rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              Learn More About Us
            </a>
            <a
              href="/programs"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              View Our Programs
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonatePageClient;

