import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
const GEMINI_TIMEOUT_MS = 30000;
const GEMINI_MAX_RETRIES = 1;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

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

export async function parseReadmeWithGemini(readmeText: string): Promise<ProjectInfo> {
  const truncatedReadme = readmeText.slice(0, 6000);

  let lastError: unknown;
  for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt++) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `You are a technical analyst for software engineering projects.
    Analyze this GitHub README and extract information with a clear, professional tone.
    The 'narrative' should be an in-depth technical breakdown (3-4 paragraphs) explaining architecture, implementation decisions, challenges solved, and measurable outcomes, formatted with markdown (bold, lists as needed).
    
    README content:
    ${truncatedReadme}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "A refined, human-readable project title.",
                },
                description: {
                  type: Type.STRING,
                  description: "A concise, technical 1-sentence summary for a project card.",
                },
                narrative: {
                  type: Type.STRING,
                  description: "An in-depth, markdown-formatted technical breakdown of the project.",
                },
                role: {
                  type: Type.STRING,
                  description: "The primary role held during development (e.g., Lead Architect, Systems Designer).",
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "A curated list of up to 5 technical keywords.",
                },
              },
              required: ["name", "description", "narrative", "role", "tags"],
            },
          },
        }),
        GEMINI_TIMEOUT_MS,
        "Gemini request timed out",
      );

      const text = response.text;
      if (!text) throw new Error("Gemini failed to generate project info");

      try {
        return JSON.parse(text) as ProjectInfo;
      } catch (error) {
        console.error("JSON Parse Error:", text);
        throw new Error("Failed to parse Gemini response");
      }
    } catch (error) {
      lastError = error;
      if (attempt === GEMINI_MAX_RETRIES) break;
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : "Gemini generation failed";
  throw new Error(errorMessage);
}
