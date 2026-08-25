import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().min(1).max(4000),
  followUp: z.boolean().optional(),
});

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1).max(80),
  messages: z.array(chatMessageSchema).min(1).max(20),
});

function asNumber(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replaceAll(/[₹,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true" || value === 1) {
    return true;
  }
  return false;
}

export const intentSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object") {
    return value;
  }
  const raw = value as Record<string, unknown>;
  return {
    category: typeof raw.category === "string" ? raw.category : null,
    budget: asNumber(raw.budget),
    preferences: asStringArray(raw.preferences),
    usage: typeof raw.usage === "string" ? raw.usage : null,
    constraints: asStringArray(raw.constraints),
    query: typeof raw.query === "string" ? raw.query : "",
    needsFollowUp: asBoolean(raw.needsFollowUp),
    followUpQuestion:
      typeof raw.followUpQuestion === "string" ? raw.followUpQuestion : null,
  };
}, z.object({
  category: z.string().nullable(),
  budget: z.number().nonnegative().nullable(),
  preferences: z.array(z.string()),
  usage: z.string().nullable(),
  constraints: z.array(z.string()),
  query: z.string(),
  needsFollowUp: z.boolean(),
  followUpQuestion: z.string().nullable(),
}));

export const reasonKeySchema = z.enum([
  "price",
  "stock",
  "rating",
  "brand",
  "spec",
]);

export const phraseSchema = z.object({
  intro: z.string().max(500).optional(),
  selectedProductIds: z.array(z.string()).max(3).optional().default([]),
  reasonKeys: z.record(z.string(), z.array(reasonKeySchema)).optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type Intent = z.infer<typeof intentSchema>;
export type ReasonKey = z.infer<typeof reasonKeySchema>;
export type PhraseResult = z.infer<typeof phraseSchema>;
