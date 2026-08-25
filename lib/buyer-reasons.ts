import type { Product } from "@/lib/types";
import type { ReasonKey } from "@/lib/buyer-schemas";
import { formatInr, stockLabel } from "@/lib/format";

const DEFAULT_REASON_KEYS: ReasonKey[] = ["price", "stock", "rating"];

export function allowedReasonKeys(keys: ReasonKey[] | undefined): ReasonKey[] {
  return [...new Set(keys && keys.length > 0 ? keys : DEFAULT_REASON_KEYS)];
}

export function reasonFacts(
  product: Product,
  keys: ReasonKey[],
  budget?: number,
): string[] {
  const facts: string[] = [];

  for (const key of allowedReasonKeys(keys)) {
    if (key === "price") {
      const budgetNote =
        budget != null ? ` (within stated budget ${formatInr(budget)})` : "";
      facts.push(`Price ${formatInr(product.price_inr)}${budgetNote}`);
    }
    if (key === "stock") {
      facts.push(stockLabel(product.stock));
    }
    if (key === "rating") {
      facts.push(`Rating ${product.rating} / 5`);
    }
    if (key === "brand") {
      facts.push(`Brand ${product.brand}`);
    }
    if (key === "spec") {
      for (const [specKey, value] of Object.entries(product.specifications)) {
        facts.push(`${specKey.replaceAll("_", " ")}: ${value}`);
      }
    }
  }

  return facts;
}

export function compactCatalogRow(product: Product) {
  return {
    id: product.id,
    title: product.title,
    category: product.category,
    brand: product.brand,
    availableReasonKeys: ["price", "stock", "rating", "brand", "spec"],
  };
}
