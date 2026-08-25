import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-2.5-flash";

function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function generateJson(prompt: string, system: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_UNAVAILABLE");
  } 

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: getGeminiModel(),
    contents: prompt,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("GEMINI_EMPTY");
  }

  return JSON.parse(extractJsonText(text)) as unknown;
}
