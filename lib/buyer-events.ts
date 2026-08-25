import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type BuyerEvent = {
  sessionId: string;
  timestamp: string;
  type: "message" | "intent" | "recommendation" | "follow_up";
  productIds?: string[];
  constraints?: {
    category?: string;
    budget?: number;
    inStock: true;
  };
  followUp?: boolean;
};

const eventsDir = path.join(process.cwd(), "data", "events");
const eventsFile = path.join(eventsDir, "buyer.jsonl");

export async function recordBuyerEvent(event: BuyerEvent): Promise<void> {
  try {
    await mkdir(eventsDir, { recursive: true });
    await appendFile(eventsFile, `${JSON.stringify(event)}\n`, "utf8");
  } catch {
    // Local-dev logging must not break the buyer chat.
  }
}
