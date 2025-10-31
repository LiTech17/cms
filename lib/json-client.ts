// /lib/json-client.ts
import fs from "fs";
import path from "path";

/**
 * Server-side JSON fetch (reads directly from /data).
 */
export async function fetchJsonServer<T>(filename: string): Promise<T | null> {
  try {
    const filePath = path.join(process.cwd(), "data", filename);
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Server fetch error for ${filename}:`, err);
    return null;
  }
}

/**
 * Client-side fetch via API (already exists)
 */
export async function fetchJson<T>(filename: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/json/${filename}`);
    if (!res.ok) {
      console.error(`Client fetch failed for ${filename}: Status ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Client fetch error for ${filename}:`, err);
    return null;
  }
}
