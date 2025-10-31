// /lib/json-server.ts
import path from 'path';
import fs from 'fs/promises';

export async function fetchJsonServer<T>(filename: string): Promise<T | null> {
  const filePath = path.join(process.cwd(), 'data', filename);

  try {
    const fileContents = await fs.readFile(filePath, 'utf-8');
    if (!fileContents.trim()) return null;
    return JSON.parse(fileContents) as T;
  } catch (error) {
    console.error(`[Server JSON Fetch] Failed to read ${filename}:`, error);
    return null;
  }
}
