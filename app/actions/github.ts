"use server";

import { unstable_cache } from "next/cache";
import { z } from "zod";

// Define TypeScript interfaces
interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
}

interface RepoConfig {
  owner: string;
  repo: string;
  branch?: string;
}

const repoConfigSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().optional(),
});

// Validate environment variables
const validateEnv = (): RepoConfig => {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!owner || !repo) {
    throw new Error(
      "Missing required environment variables: GITHUB_REPO_OWNER and/or GITHUB_REPO_NAME"
    );
  }

  return { owner, repo, branch };
};

// Fetch raw content from GitHub
const fetchRawContent = async (url: string): Promise<string> => {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3.raw",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
  }

  return response.text();
};

// Fetch repository contents
export const fetchRepoContents = async (): Promise<GitHubFile[]> => {
  const config = validateEnv();
  
  // Validate config with Zod
  const parsedConfig = repoConfigSchema.parse(config);
  const { owner, repo, branch } = parsedConfig;

  // Use unstable_cache to cache results for 1 hour (3600 seconds)
  const cachedFetch = unstable_cache(
    async (): Promise<GitHubFile[]> => {
      try {
        const token = process.env.GITHUB_TOKEN;
        const headers: HeadersInit = {
          Accept: "application/vnd.github.v3+json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Fetch repository contents
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Filter files by extension
        const allowedExtensions = [".py", ".c", ".cpp", ".h", ".md"];
        const filteredFiles = (data as GitHubFile[]).filter(file => 
          allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
        );

        // Fetch content for each file
        const filesWithContent = await Promise.all(
          filteredFiles.map(async (file) => {
            if (file.type === "file") {
              try {
                const content = await fetchRawContent(file.download_url);
                return { ...file, content };
              } catch (error) {
                console.error(`Failed to fetch content for ${file.path}:`, error);
                return { ...file, content: "" };
              }
            }
            return file;
          })
        );

        return filesWithContent;
      } catch (error) {
        console.error("Error fetching repository contents:", error);
        throw error;
      }
    },
    ["github-repo-contents"],
    { revalidate: 3600 } // Cache for 1 hour
  );

  return cachedFetch();
};