import { getProductBySku, getProducts, invalidateCatalogCache } from "@/lib/catalog";
import {
  ensureOverlayCatalog,
  readAssociationState,
  writeAssociationState,
  writeOverlayCatalog,
} from "@/lib/merchant-store";
import type { AssociationPair } from "@/lib/merchant-schemas";

export type AssociationReason = "csv" | "compatible_skus";

export type AssociationSuggestion = AssociationPair & {
  reason: AssociationReason;
};

const MAX_RECIPROCAL_SUGGESTIONS = 20;

function pairKey(pair: AssociationPair): string {
  return `${pair.fromSku}\u0000${pair.toSku}`;
}

function hasPair(list: AssociationPair[], pair: AssociationPair): boolean {
  const key = pairKey(pair);
  return list.some((item) => pairKey(item) === key);
}

export async function listAssociationSuggestions(): Promise<AssociationSuggestion[]> {
  const products = getProducts();
  const bySku = new Map(products.map((product) => [product.sku, product]));
  const state = await readAssociationState();
  const dismissed = new Set(state.dismissed.map(pairKey));
  const suggestions: AssociationSuggestion[] = [];
  const seen = new Set<string>();

  const push = (pair: AssociationPair, reason: AssociationReason) => {
    const key = pairKey(pair);
    if (seen.has(key) || dismissed.has(key)) {
      return false;
    }
    const from = bySku.get(pair.fromSku);
    const to = bySku.get(pair.toSku);
    if (!from || !to || pair.fromSku === pair.toSku) {
      return false;
    }
    if (from.compatible_skus.includes(pair.toSku)) {
      return false;
    }
    seen.add(key);
    suggestions.push({ ...pair, reason });
    return true;
  };

  for (const pair of state.pendingCsv) {
    push(pair, "csv");
  }

  let reciprocalCount = 0;
  for (const product of products) {
    if (reciprocalCount >= MAX_RECIPROCAL_SUGGESTIONS) {
      break;
    }
    for (const toSku of product.compatible_skus) {
      if (reciprocalCount >= MAX_RECIPROCAL_SUGGESTIONS) {
        break;
      }
      const related = bySku.get(toSku);
      if (!related || related.compatible_skus.includes(product.sku)) {
        continue;
      }
      if (push({ fromSku: related.sku, toSku: product.sku }, "compatible_skus")) {
        reciprocalCount += 1;
      }
    }
  }

  return suggestions;
}

export async function acceptAssociation(pair: AssociationPair): Promise<{ ok: boolean; error?: string }> {
  const from = getProductBySku(pair.fromSku);
  const to = getProductBySku(pair.toSku);
  if (!from || !to) {
    return { ok: false, error: "Both SKUs must exist in the current catalog." };
  }

  const overlay = await ensureOverlayCatalog();
  const target = overlay.find((product) => product.sku === pair.fromSku);
  if (!target) {
    return { ok: false, error: "Product was not found on the overlay." };
  }
  if (!target.compatible_skus.includes(pair.toSku)) {
    target.compatible_skus = [...target.compatible_skus, pair.toSku];
  }
  await writeOverlayCatalog(overlay);

  const state = await readAssociationState();
  state.pendingCsv = state.pendingCsv.filter((item) => pairKey(item) !== pairKey(pair));
  await writeAssociationState(state);
  invalidateCatalogCache();
  return { ok: true };
}

export async function dismissAssociation(pair: AssociationPair): Promise<void> {
  const state = await readAssociationState();
  if (!hasPair(state.dismissed, pair)) {
    state.dismissed = [...state.dismissed, pair];
  }
  state.pendingCsv = state.pendingCsv.filter((item) => pairKey(item) !== pairKey(pair));
  await writeAssociationState(state);
}
