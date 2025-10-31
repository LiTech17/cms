// /components/image-picker-modal.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { MediaData, MediaItem } from '@/lib/types';
import toast from 'react-hot-toast';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imagePath: string) => void;
  currentImage?: string;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentImage,
}) => {
  const [mediaData, setMediaData] = useState<MediaData>({ uploads: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<'gallery' | 'upload'>('gallery');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMediaData();
    }
  }, [isOpen]);

  const fetchMediaData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/json/media.json');
      if (response.ok) {
        const data = await response.json();
        setMediaData(data || { uploads: [] });
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', altText || file.name);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      toast.success('Image uploaded successfully!');

      // Refresh media data
      await fetchMediaData();

      // Select the newly uploaded image
      onSelect(result.filename);
      setUploadTab('gallery');
      setAltText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Select Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setUploadTab('gallery')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              uploadTab === 'gallery'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="w-5 h-5 inline-block mr-2" />
            Gallery
          </button>
          <button
            onClick={() => setUploadTab('upload')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              uploadTab === 'upload'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {uploadTab === 'gallery' ? (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : mediaData.uploads.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No images in gallery yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Switch to Upload tab to add your first image.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaData.uploads.map((item: MediaItem) => (
                    <button
                      key={item.filename}
                      onClick={() => {
                        onSelect(item.filename);
                        onClose();
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === item.filename
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <Image
                        src={item.filename}
                        alt={item.alt}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-lg"
                      />
                      {currentImage === item.filename && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">Selected</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image..."
                  className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Choose Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="w-full border border-input rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: JPEG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>

              {isUploading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Uploading...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePickerModal;

