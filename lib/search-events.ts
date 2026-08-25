import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { SEARCH_EVENTS_PATH } from "@/lib/merchant-paths";

export type SearchEvent = {
  type: "search";
  timestamp: string;
  query?: string;
  filters?: {
    category?: string;
    brand?: string;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
  };
};

export async function recordSearchEvent(event: SearchEvent): Promise<void> {
  try {
    await mkdir(path.dirname(SEARCH_EVENTS_PATH), { recursive: true });
    await appendFile(SEARCH_EVENTS_PATH, `${JSON.stringify(event)}\n`, "utf8");
  } catch {
    // Local-dev logging must not break catalog search.
  }
}
