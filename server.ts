import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectInfo } from "./src/types";

dotenv.config({ path: path.join(process.cwd(), ".env"), override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_TIMEOUT_MS = 30000;
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-3-flash-preview",
];

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function getGeminiApiKey(): string {
  const raw = process.env.GEMINI_API_KEY ?? process.env.VITE_GEMINI_API_KEY ?? "";
  return raw.trim().replace(/^['\"]|['\"]$/g, "");
}

function mapGeminiErrorStatus(message: string): number {
  const lower = message.toLowerCase();
  if (lower.includes("timed out") || lower.includes("timeout")) return 504;
  if (lower.includes("unauth") || lower.includes("api key") || lower.includes("permission")) return 401;
  if (lower.includes("quota") || lower.includes("rate") || lower.includes("resource_exhausted")) return 429;
  if (lower.includes("not found") || lower.includes("unsupported") || lower.includes("model")) return 502;
  return 502;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const GITHUB_README_TIMEOUT_MS = 15000;

  app.use(express.json());

  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "unknown-spec10";
  const GITHUB_ACCOUNT_URL = process.env.GITHUB_ACCOUNT_URL || `https://github.com/${GITHUB_USERNAME}`;

  async function fetchReadmeFromRawContent(owner: string, repo: string): Promise<string | null> {
    const candidates = [
      `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/readme.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/main/readme.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/readme.md`,
    ];

    for (const url of candidates) {
      try {
        const response = await fetch(url, {
          headers: { Accept: "text/plain" },
        });

        if (response.ok) {
          return await response.text();
        }
      } catch {
        // Try the next common default branch/path.
      }
    }

    return null;
  }

  // API Route: Get hardcoded portfolio info
  app.get("/api/portfolio-repo", (req, res) => {
    res.json({ 
      url: GITHUB_ACCOUNT_URL,
      username: GITHUB_USERNAME 
    });
  });

  // API Route: Fetch all public repos for the user
  app.get("/api/github/repos", async (req, res) => {
    const tokenHeader = req.headers["x-github-token"];
    const githubToken = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;
    const queryUsername = typeof req.query.username === "string" ? req.query.username : null;

    try {
      const endpoint = githubToken
        ? "https://api.github.com/user/repos?sort=updated&per_page=100"
        : `https://api.github.com/users/${queryUsername || GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };

      if (githubToken) {
        headers.Authorization = `token ${githubToken}`;
      }

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch repositories" });
      }

      const repos = await response.json();
      res.json(repos);
    } catch (error) {
      console.error("GitHub Repos Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  // API Route: Proxy GitHub README fetch
  // This helps avoid client-side CORS issues and rate limits if we add a token later
  app.get("/api/github/readme", async (req, res) => {
    const { owner, repo } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and Repo are required" });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GITHUB_README_TIMEOUT_MS);
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const fallbackReadme = await fetchReadmeFromRawContent(String(owner), String(repo));
        if (fallbackReadme) {
          return res.json({ readme: fallbackReadme });
        }

        return res.status(response.status).json({ error: "README not found" });
      }

      const data = await response.json() as { content: string };
      const readme = Buffer.from(data.content, "base64").toString("utf-8");
      res.json({ readme });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        const fallbackReadme = await fetchReadmeFromRawContent(String(owner), String(repo));
        if (fallbackReadme) {
          return res.json({ readme: fallbackReadme });
        }

        return res.status(504).json({ error: "README request timed out" });
      }
      const fallbackReadme = await fetchReadmeFromRawContent(String(owner), String(repo));
      if (fallbackReadme) {
        return res.json({ readme: fallbackReadme });
      }
      console.error("GitHub Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch README" });
    }
  });

  app.post("/api/ai/parse-readme", async (req, res) => {
    const readmeText = typeof req.body?.readme === "string" ? req.body.readme : "";
    if (!readmeText) {
      return res.status(400).json({ error: "README content is required" });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const truncatedReadme = readmeText.slice(0, 6000);
    const basePrompt = `You are a technical analyst for software engineering projects.
Analyze this GitHub README and extract information with a clear, professional tone.
The 'narrative' should be an in-depth technical breakdown (3-4 paragraphs) explaining architecture, implementation decisions, challenges solved, and measurable outcomes, formatted with markdown (bold, lists as needed).

README content:
${truncatedReadme}`;

    try {
      let responseText = "";
      let lastError: string | null = null;

      for (const model of GEMINI_MODELS) {
        try {
          const response = await withTimeout(
            ai.models.generateContent({
              model,
              contents: basePrompt,
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    narrative: { type: Type.STRING },
                    role: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["name", "description", "narrative", "role", "tags"],
                },
              },
            }),
            GEMINI_TIMEOUT_MS,
            `Gemini request timed out (${model})`,
          );

          if (!response.text) {
            throw new Error(`Gemini returned empty content (${model})`);
          }

          responseText = response.text;
          lastError = null;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error.message : "Gemini generation failed";
        }
      }

      if (!responseText) {
        const statusCode = mapGeminiErrorStatus(lastError || "Gemini generation failed");
        return res.status(statusCode).json({ error: lastError || "Gemini generation failed" });
      }

      let parsed: ProjectInfo;
      try {
        parsed = JSON.parse(responseText) as ProjectInfo;
      } catch {
        return res.status(502).json({ error: "Gemini returned invalid JSON" });
      }

      return res.json(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gemini generation failed";
      const statusCode = mapGeminiErrorStatus(message);
      return res.status(statusCode).json({ error: message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
