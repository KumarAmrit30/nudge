import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");
export const SEED_CATALOG_PATH = path.join(DATA_DIR, "products.json");
export const OVERLAY_CATALOG_PATH = path.join(DATA_DIR, "merchant-catalog.json");
export const ASSOCIATION_STATE_PATH = path.join(
  DATA_DIR,
  "merchant-association-state.json",
);
export const IMPORT_STATUS_PATH = path.join(DATA_DIR, "merchant-import-status.json");
export const SEARCH_EVENTS_PATH = path.join(DATA_DIR, "events", "search.jsonl");
export const BUYER_EVENTS_PATH = path.join(DATA_DIR, "events", "buyer.jsonl");

export const MAX_CSV_BYTES = 256 * 1024;
export const MAX_CSV_ROWS = 500;

export function assertNotSeedPath(filePath: string): void {
  if (path.resolve(filePath) === path.resolve(SEED_CATALOG_PATH)) {
    throw new Error("Refusing to modify committed seed catalog.");
  }
}
