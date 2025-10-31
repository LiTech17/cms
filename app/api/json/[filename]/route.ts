// /app/api/json/[filename]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// In Next.js 15, params are now a Promise and must be awaited
export async function GET(_: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const filePath = path.join(process.cwd(), 'data', filename);

  try {
    const fileContents = await fs.promises.readFile(filePath, 'utf-8');
    if (!fileContents.trim()) return NextResponse.json(null);
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(null, { status: 500 });
  }
}