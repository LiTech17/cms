// /lib/github.ts

// Server-side environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // server-side only
const REPO = process.env.GITHUB_REPO; // e.g. "username/repo-name"
const BRANCH = process.env.GITHUB_BRANCH || "main";

if (typeof window === 'undefined' && (!GITHUB_TOKEN || !REPO)) {
  console.warn("⚠️ GITHUB_TOKEN or GITHUB_REPO environment variables not set. GitHub commits are disabled.");
}

// ------------------------
// Type Definitions
// ------------------------

interface GitHubFileResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  // ... (other file properties)
}

interface GitHubCommitResponse {
  content: GitHubFileResponse;
  commit: {
    sha: string;
    // ... (other commit properties)
  };
}

type GetJSONResult = { content: any; sha?: string } | null;

// ------------------------
// Fetch JSON from GitHub
// ------------------------
/**
 * Fetches and parses a JSON file from the GitHub repository.
 */
export async function getJSON(path: string): Promise<GetJSONResult> {
  if (!GITHUB_TOKEN || !REPO) return null;

  const apiPath = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`;

  // FIX: Use global fetch
  const res = await fetch(apiPath, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw", // Request raw content for JSON parsing
    },
    // Use 'no-store' cache option for Server Components to ensure fresh content before editing
    cache: 'no-store'
  });

  if (res.status === 200) {
    const text = await res.text();
    try {
      // NOTE: GitHub sends the SHA differently for raw requests.
      // This implementation fetches SHA separately in updateJSON.
      return { content: JSON.parse(text) };
    } catch {
      return { content: text };
    }
  } else if (res.status === 404) {
    return null;
  } else {
    const body = await res.text();
    console.error(`GitHub getJSON error ${res.status} for ${path}: ${body}`);
    return null; // Return null instead of throwing to prevent application crash
  }
}

// ------------------------
// Update JSON in GitHub
// ------------------------
/**
 * Commits a modified JSON object back to the GitHub repository.
 * @param path The path to the file to commit (e.g., 'data/home.json').
 * @param data The new JSON object to serialize and commit.
 * @param commitMessage The GitHub commit message.
 */
export async function updateJSON(path: string, data: any, commitMessage: string): Promise<GitHubCommitResponse> {
  if (!GITHUB_TOKEN || !REPO) {
    console.error("Cannot commit: GITHUB_TOKEN or REPO not configured.");
    // Simulate success to prevent client errors when running locally without a token
    return { content: {} as GitHubFileResponse, commit: {} as any };
  }

  // 1. Get current SHA (required for PUT request)
  const getUrl = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    cache: 'no-store'
  });

  let sha: string | undefined;

  if (getRes.status === 200) {
    const json = (await getRes.json()) as GitHubFileResponse;
    sha = json.sha;
  } else if (getRes.status === 404) {
    sha = undefined; // File does not exist, GitHub will create it
  } else {
    const body = await getRes.text();
    throw new Error(`Failed to get file sha: ${getRes.status} ${body}`);
  }

  // 2. Prepare content and commit payload
  const contentBase64 = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  const putUrl = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}`;

  // 3. Commit the file (PUT request)
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    body: JSON.stringify({
      message: commitMessage,
      content: contentBase64,
      branch: BRANCH,
      sha, // If defined, updates; if undefined, creates
    }),
  });

  // FIX APPLIED HERE: safer error parsing and throwing
  const putJson = (await putRes.json()) as any; // Cast to 'any' for safer error reading

  if (!putRes.ok) {
    console.error(`GitHub update error: ${JSON.stringify(putJson)}`);

    // FIX: Safely read error message (GitHub may return nested errors)
    const errorMessage =
      putJson.message ||
      putJson.errors?.[0]?.message ||
      'Unknown GitHub API error.';

    throw new Error(`GitHub update error: ${putRes.status} - ${errorMessage}`);
  }

  // Cast to the expected success type only after checking for errors
  return putJson as GitHubCommitResponse;
}

// ------------------------
// Required Export for Home Page
// ------------------------
/**
 * Wraps updateJSON for content editing flow. Required by /app/page.tsx.
 */
export async function commitJsonChange<T>(filePath: string, content: T, message: string): Promise<void> {
  await updateJSON(filePath, content, message);
}
