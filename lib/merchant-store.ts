import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { getProducts, invalidateCatalogCache, isOverlayActive } from "@/lib/catalog";
import {
  ASSOCIATION_STATE_PATH,
  DATA_DIR,
  IMPORT_STATUS_PATH,
  OVERLAY_CATALOG_PATH,
  assertNotSeedPath,
} from "@/lib/merchant-paths";
import {
  associationStateSchema,
  importStatusSchema,
  type AssociationState,
  type ImportStatus,
} from "@/lib/merchant-schemas";
import type { Product } from "@/lib/types";

const emptyAssociationState = (): AssociationState => ({
  dismissed: [],
  pendingCsv: [],
});

async function readJsonFile<T>(
  filePath: string,
  fallback: T,
  parse: (value: unknown) => T,
): Promise<T> {
  if (!existsSync(filePath)) {
    return fallback;
  }
  try {
    const raw = await readFile(filePath, "utf8");
    return parse(JSON.parse(raw) as unknown);
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  assertNotSeedPath(filePath);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function deleteLocalFile(filePath: string): Promise<void> {
  assertNotSeedPath(filePath);
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}

export async function readAssociationState(): Promise<AssociationState> {
  return readJsonFile(ASSOCIATION_STATE_PATH, emptyAssociationState(), (value) =>
    associationStateSchema.parse(value),
  );
}

export async function writeAssociationState(
  state: AssociationState,
): Promise<void> {
  await writeJsonFile(ASSOCIATION_STATE_PATH, state);
}

export async function readImportStatus(): Promise<ImportStatus | null> {
  return readJsonFile(IMPORT_STATUS_PATH, null, (value) =>
    importStatusSchema.parse(value),
  );
}

export async function writeImportStatus(status: ImportStatus): Promise<void> {
  await writeJsonFile(IMPORT_STATUS_PATH, status);
}

export async function writeOverlayCatalog(products: Product[]): Promise<void> {
  await writeJsonFile(OVERLAY_CATALOG_PATH, products);
  invalidateCatalogCache();
}

export async function ensureOverlayCatalog(): Promise<Product[]> {
  if (isOverlayActive()) {
    return structuredClone(getProducts());
  }
  const copy = structuredClone(getProducts());
  await writeOverlayCatalog(copy);
  return copy;
}

export async function resetToSeed(): Promise<void> {
  await deleteLocalFile(OVERLAY_CATALOG_PATH);
  await deleteLocalFile(ASSOCIATION_STATE_PATH);
  await deleteLocalFile(IMPORT_STATUS_PATH);
  invalidateCatalogCache();
}
