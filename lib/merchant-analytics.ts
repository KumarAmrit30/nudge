import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { BUYER_EVENTS_PATH, SEARCH_EVENTS_PATH } from "@/lib/merchant-paths";

export type MerchantAnalytics = {
  searches: number;
  recommendedCount: number;
  recommendedTop: { productId: string; count: number }[];
  addToCart: 0;
  paymentSuccess: 0;
};

type JsonlRecord = Record<string, unknown>;

async function readJsonl(filePath: string): Promise<JsonlRecord[]> {
  if (!existsSync(filePath)) {
    return [];
  }
  const text = await readFile(filePath, "utf8");
  const rows: JsonlRecord[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        rows.push(parsed as JsonlRecord);
      }
    } catch {
      // Skip malformed local-dev lines.
    }
  }
  return rows;
}

export async function getMerchantAnalytics(): Promise<MerchantAnalytics> {
  const [searchRows, buyerRows] = await Promise.all([
    readJsonl(SEARCH_EVENTS_PATH),
    readJsonl(BUYER_EVENTS_PATH),
  ]);

  const searchEvents = searchRows.filter((row) => row.type === "search").length;
  const intentEvents = buyerRows.filter((row) => row.type === "intent").length;
  const recommendationRows = buyerRows.filter((row) => row.type === "recommendation");
  const counts = new Map<string, number>();
  for (const row of recommendationRows) {
    const ids = Array.isArray(row.productIds) ? row.productIds : [];
    for (const id of ids) {
      if (typeof id !== "string" || !id) {
        continue;
      }
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  const recommendedTop = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([productId, count]) => ({ productId, count }));

  return {
    searches: searchEvents + intentEvents,
    recommendedCount: recommendationRows.length,
    recommendedTop,
    addToCart: 0,
    paymentSuccess: 0,
  };
}
