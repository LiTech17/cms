'use client';

import React, { useCallback, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ----------------------
// Button Mock (shadcn/ui style)
// ----------------------
const Button = ({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-full bg-background/50 backdrop-blur text-foreground hover:bg-background transition-colors ${className}`}
  >
    {children}
  </button>
);

// ----------------------
// Props Interface
// ----------------------
interface ImageCarouselProps {
  images: string[];
  altText: string;
  aspectRatioClass?: string; // e.g., 'aspect-video' or 'aspect-[16/10]'
}

// ----------------------
// Main Component
// ----------------------
export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  altText,
  aspectRatioClass = 'aspect-video',
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: false },
    [Autoplay({ delay: 5000, stopOnInteraction: false, playOnInit: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Pause autoplay on focus (accessibility)
  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins().autoplay;

    const handleFocusIn = () => autoplay?.stop();
    const handleFocusOut = () => autoplay?.play();

    emblaApi.rootNode().addEventListener('focusin', handleFocusIn, true);
    emblaApi.rootNode().addEventListener('focusout', handleFocusOut, true);

    return () => {
      emblaApi.rootNode().removeEventListener('focusin', handleFocusIn, true);
      emblaApi.rootNode().removeEventListener('focusout', handleFocusOut, true);
    };
  }, [emblaApi]);

  if (!images?.length) {
    return (
      <div
        className={`w-full ${aspectRatioClass} bg-muted flex items-center justify-center rounded-2xl`}
      >
        No images available.
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden w-full ${aspectRatioClass} rounded-2xl shadow-lg`}>
      <div className="embla h-full w-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {images.map((src, index) => (
            <div className="embla__slide relative flex-[0_0_100%] min-w-0" key={index}>
              <Image
                src={src}
                alt={`${altText} - Slide ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                className="w-full h-full rounded-2xl"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <Button onClick={scrollPrev} className="z-10">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button onClick={scrollNext} className="z-10">
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default ImageCarousel;
