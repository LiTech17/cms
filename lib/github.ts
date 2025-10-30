// lib/github.ts
import fetch from "node-fetch";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // server-side only
const REPO = process.env.GITHUB_REPO; // e.g. "username/repo-name"
const BRANCH = process.env.GITHUB_BRANCH || "main";

if (!GITHUB_TOKEN || !REPO) {
  console.warn("GITHUB_TOKEN or GITHUB_REPO not set in environment.");
}

type GetJSONResult = { content: any; sha?: string } | null;

export async function getJSON(path: string): Promise<GetJSONResult> {
  // path example: "data/home.json"
  const apiPath = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`;
  const res = await fetch(apiPath, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw"
    }
  });
  if (res.status === 200) {
    // If Accept raw, body will be file content
    const text = await res.text();
    try {
      return { content: JSON.parse(text) };
    } catch (e) {
      // maybe not JSON
      return { content: text };
    }
  } else if (res.status === 404) {
    return null;
  } else {
    const body = await res.text();
    throw new Error(`GitHub getJSON error ${res.status}: ${body}`);
  }
}

export async function updateJSON(path: string, data: any, commitMessage: string) {
  // Steps: get file to fetch current sha -> put with base64 content
  const getUrl = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" }
  });

  let sha: string | undefined;
  if (getRes.status === 200) {
    const json = await getRes.json();
    sha = json.sha;
  } else if (getRes.status === 404) {
    sha = undefined; // new file
  } else {
    const body = await getRes.text();
    throw new Error(`Failed to get file sha: ${getRes.status} ${body}`);
  }

  const contentBase64 = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  const putUrl = `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}`;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" },
    body: JSON.stringify({
      message: commitMessage,
      content: contentBase64,
      branch: BRANCH,
      sha
    })
  });

  const putJson = await putRes.json();
  if (!putRes.ok) {
    throw new Error(`GitHub update error: ${JSON.stringify(putJson)}`);
  }
  return putJson; // contains commit info
}
