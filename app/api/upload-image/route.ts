// /app/api/upload-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { uploadBinaryFile, updateJSON, getJSON } from '@/lib/github';
import { MediaData, MediaItem } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('altText') as string) || 'Uploaded image';

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString('base64');

    // Generate filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `upload-${timestamp}.${extension}`;
    const filePath = `public/uploads/${filename}`;
    const publicPath = `/uploads/${filename}`;

    // Upload to GitHub
    await uploadBinaryFile(
      filePath,
      base64Content,
      `Upload image: ${filename}`
    );

    // Update media.json
    const mediaResult = await getJSON('data/media.json');
    const mediaData: MediaData = mediaResult?.content || { uploads: [] };

    const newMediaItem: MediaItem = {
      filename: publicPath,
      alt: altText,
      uploadedAt: new Date().toISOString(),
    };

    mediaData.uploads.push(newMediaItem);

    await updateJSON(
      'data/media.json',
      mediaData,
      `Add image to media library: ${filename}`
    );

    return NextResponse.json({
      success: true,
      filename: publicPath,
      mediaItem: newMediaItem,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}

