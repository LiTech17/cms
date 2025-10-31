// /app/api/json/[filename]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// FIX: Removed the unused 'req: NextRequest' parameter.
export async function GET(_: NextRequest, { params }: { params: { filename: string } }) { 
// Alternative fix: You could keep 'req' and just start its name with an underscore:
// export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const { filename } = params;
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