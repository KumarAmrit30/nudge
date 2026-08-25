import { existsSync, readFileSync, statSync } from "node:fs";
import type { Product, SearchProductsInput } from "@/lib/types";
import { searchProducts as filterProducts } from "@/lib/search";
import {
  OVERLAY_CATALOG_PATH,
  SEED_CATALOG_PATH,
} from "@/lib/merchant-paths";

type CatalogCache = {
  source: string;
  mtimeMs: number;
  products: Product[];
};

let cache: CatalogCache | null = null;

function readCatalogFile(filePath: string): Product[] {
  const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`Catalog at ${filePath} is not an array.`);
  }
  return parsed as Product[];
}

function loadProducts(): Product[] {
  const overlay = existsSync(OVERLAY_CATALOG_PATH);
  const source = overlay ? OVERLAY_CATALOG_PATH : SEED_CATALOG_PATH;
  const mtimeMs = statSync(source).mtimeMs;
  if (cache && cache.source === source && cache.mtimeMs === mtimeMs) {
    return cache.products;
  }

  try {
    const products = readCatalogFile(source);
    cache = { source, mtimeMs, products };
    return products;
  } catch {
    if (overlay) {
      const products = readCatalogFile(SEED_CATALOG_PATH);
      const seedMtime = statSync(SEED_CATALOG_PATH).mtimeMs;
      cache = { source: SEED_CATALOG_PATH, mtimeMs: seedMtime, products };
      return products;
    }
    throw new Error("Seed catalog could not be read.");
  }
}

export function invalidateCatalogCache(): void {
  cache = null;
}

export function isOverlayActive(): boolean {
  return existsSync(OVERLAY_CATALOG_PATH);
}

export function getProducts(): Product[] {
  return loadProducts();
}

export function getProductById(id: string): Product | undefined {
  return loadProducts().find((product) => product.id === id);
}

export function getProductBySku(sku: string): Product | undefined {
  return loadProducts().find((product) => product.sku === sku);
}

export function getCategories(): string[] {
  return [...new Set(loadProducts().map((product) => product.category))].sort();
}

export function getBrands(): string[] {
  return [...new Set(loadProducts().map((product) => product.brand))].sort();
}

export function searchProducts(input: SearchProductsInput = {}): Product[] {
  return filterProducts(loadProducts(), input);
}

export function getProductDetails(productIds: string[]): Product[] {
  const wanted = new Set(productIds);
  return loadProducts().filter((product) => wanted.has(product.id));
}

export function getCompatibleAddOns(input: {
  productId: string;
  budget?: number;
}): Product[] {
  const product = getProductById(input.productId);
  if (!product) {
    return [];
  }

  return product.compatible_skus
    .map((sku) => getProductBySku(sku))
    .filter((related): related is Product => related != null)
    .filter((related) => related.stock > 0)
    .filter(
      (related) => input.budget == null || related.price_inr <= input.budget,
    )
    .sort((a, b) => b.rating - a.rating);
}
