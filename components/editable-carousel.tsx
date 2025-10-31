// /components/editable-carousel.tsx

'use client';

import React, { useState } from 'react';
import ImageCarousel from './carousel';
import ImagePickerModal from './image-picker-modal';
import { useAuth } from './auth-provider';
import { ImageIcon, Plus, X } from 'lucide-react';

interface EditableCarouselProps {
  images: string[];
  altText: string;
  aspectRatioClass?: string;
  onImagesChange: (newImages: string[]) => void;
}

const EditableCarousel: React.FC<EditableCarouselProps> = ({
  images,
  altText,
  aspectRatioClass = 'aspect-video',
  onImagesChange,
}) => {
  const { isAuth } = useAuth();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleImageSelect = (newSrc: string) => {
    if (editingIndex !== null) {
      // Replace image at index
      const newImages = [...images];
      newImages[editingIndex] = newSrc;
      onImagesChange(newImages);
      setEditingIndex(null);
    } else {
      // Add new image
      onImagesChange([...images, newSrc]);
    }
    setIsPickerOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  if (!isAuth) {
    return <ImageCarousel images={images} altText={altText} aspectRatioClass={aspectRatioClass} />;
  }

  return (
    <>
      <div className="relative">
        <ImageCarousel images={images} altText={altText} aspectRatioClass={aspectRatioClass} />
        
        {/* Edit Controls Overlay */}
        <div className="absolute top-2 right-2 flex gap-2 z-20">
          <button
            onClick={() => {
              setEditingIndex(null);
              setIsPickerOpen(true);
            }}
            className="p-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add</span>
          </button>
        </div>

        {/* Image Edit Buttons */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-2 overflow-x-auto z-20">
          {images.map((src, index) => (
            <div key={index} className="relative flex-shrink-0">
              <button
                onClick={() => {
                  setEditingIndex(index);
                  setIsPickerOpen(true);
                }}
                className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg hover:border-primary transition-colors"
                type="button"
              >
                <img src={src} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setEditingIndex(null);
        }}
        onSelect={handleImageSelect}
        currentImage={editingIndex !== null ? images[editingIndex] : undefined}
      />
    </>
  );
};

export default EditableCarousel;

