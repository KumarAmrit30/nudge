import type { ParsedQuery, Product, SearchProductsInput } from "@/lib/types";

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "the",
  "to",
  "with",
  "under",
  "below",
  "upto",
]);

export function parseSearchQuery(query: string): ParsedQuery {
  let rest = query.trim();
  const parsed: ParsedQuery = { tokens: [] };

  const priceMatch = rest.match(
    /(?:under|below|upto|up\s*to)\s*₹?\s*([\d,]+)/i,
  );
  if (priceMatch) {
    parsed.maxPrice = Number(priceMatch[1].replaceAll(",", ""));
    rest = rest.replace(priceMatch[0], " ");
  }

  const ramMatch = rest.match(/(\d+)\s*gb\s*ram/i);
  if (ramMatch) {
    parsed.ramGb = Number(ramMatch[1]);
    rest = rest.replace(ramMatch[0], " ");
  }

  rest = rest.replaceAll(/[₹,]/g, " ");
  parsed.tokens = rest
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replaceAll(/[^\p{L}\p{N}]+/gu, ""))
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));

  return parsed;
}

function searchableText(product: Product): string {
  return [
    product.title,
    product.description,
    product.category,
    product.brand,
    product.sku,
    ...product.tags,
    ...Object.values(product.specifications),
  ]
    .join(" ")
    .toLowerCase();
}

function hasRamGb(product: Product, ramGb: number): boolean {
  const specRam = product.specifications.ram;
  if (specRam) {
    const match = specRam.match(/(\d+)/);
    return match ? Number(match[1]) === ramGb : false;
  }

  const blob = [product.title, product.description, ...product.tags]
    .join(" ")
    .toLowerCase();
  const pattern = new RegExp(`\\b${ramGb}\\s*gb(?:[\\s-]*ram)?\\b`, "i");
  return pattern.test(blob);
}

function matchesTokens(product: Product, tokens: string[]): boolean {
  if (tokens.length === 0) {
    return true;
  }
  const haystack = searchableText(product);
  return tokens.every((token) => haystack.includes(token));
}

export function searchProducts(
  catalog: Product[],
  input: SearchProductsInput = {},
): Product[] {
  const parsed = input.query ? parseSearchQuery(input.query) : { tokens: [] };
  const maxPrice =
    input.maxPrice != null && parsed.maxPrice != null
      ? Math.min(input.maxPrice, parsed.maxPrice)
      : (input.maxPrice ?? parsed.maxPrice);
  const ramGb = parsed.ramGb;

  return catalog.filter((product) => {
    if (input.category && product.category !== input.category) {
      return false;
    }
    if (input.brand && product.brand !== input.brand) {
      return false;
    }
    if (maxPrice != null && product.price_inr > maxPrice) {
      return false;
    }
    if (input.minRating != null && product.rating < input.minRating) {
      return false;
    }
    if (input.inStock === true && product.stock <= 0) {
      return false;
    }
    if (ramGb != null && !hasRamGb(product, ramGb)) {
      return false;
    }
    return matchesTokens(product, parsed.tokens);
  });
}
