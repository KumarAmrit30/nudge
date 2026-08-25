import type { Product, SearchProductsInput } from "@/lib/types";
import { searchProducts as filterProducts } from "@/lib/search";
import products from "@/data/products.json";

const catalog: Product[] = products as unknown as Product[];

export function getProducts(): Product[] {
  return catalog;
}

export function getProductById(id: string): Product | undefined {
  return catalog.find((product) => product.id === id);
}

export function getProductBySku(sku: string): Product | undefined {
  return catalog.find((product) => product.sku === sku);
}

export function getCategories(): string[] {
  return [...new Set(catalog.map((product) => product.category))].sort();
}

export function getBrands(): string[] {
  return [...new Set(catalog.map((product) => product.brand))].sort();
}

export function searchProducts(input: SearchProductsInput = {}): Product[] {
  return filterProducts(catalog, input);
}

export function getProductDetails(productIds: string[]): Product[] {
  const wanted = new Set(productIds);
  return catalog.filter((product) => wanted.has(product.id));
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
