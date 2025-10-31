// /components/editable-image.tsx

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import ImagePickerModal from './image-picker-modal';
import { useAuth } from './auth-provider';

interface EditableImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onImageChange: (newSrc: string) => void;
}

const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  objectFit = 'cover',
  onImageChange,
}) => {
  const { isAuth } = useAuth();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleImageSelect = (newSrc: string) => {
    onImageChange(newSrc);
    setIsPickerOpen(false);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {fill ? (
          <Image
            src={src || '/uploads/logo.png'}
            alt={alt}
            fill
            style={{ objectFit }}
            className="rounded-2xl"
          />
        ) : (
          <Image
            src={src || '/uploads/logo.png'}
            alt={alt}
            width={width || 800}
            height={height || 600}
            style={{ objectFit }}
            className="rounded-2xl"
          />
        )}
        {isAuth && (
          <button
            onClick={() => setIsPickerOpen(true)}
            className="absolute top-2 right-2 p-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2 z-10"
            type="button"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Change</span>
          </button>
        )}
      </div>
      {isAuth && (
        <ImagePickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={handleImageSelect}
          currentImage={src}
        />
      )}
    </>
  );
};

export default EditableImage;

