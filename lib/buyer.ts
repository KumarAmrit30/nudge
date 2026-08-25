import {
  getCategories,
  getProductDetails,
  searchProducts,
} from "@/lib/catalog";
import { recordBuyerEvent } from "@/lib/buyer-events";
import { compactCatalogRow, reasonFacts } from "@/lib/buyer-reasons";
import {
  intentSchema,
  phraseSchema,
  type ChatMessage,
  type Intent,
  type ReasonKey,
} from "@/lib/buyer-schemas";
import { generateJson } from "@/lib/gemini";
import { parseSearchQuery } from "@/lib/search";
import type { Product } from "@/lib/types";

const MAX_RECOMMENDATIONS = 3;

const FILLER = new Set([
  "hi",
  "hello",
  "hey",
  "please",
  "help",
  "me",
  "looking",
  "want",
  "need",
  "buy",
  "get",
  "something",
  "anything",
  "stuff",
  "cheap",
  "nice",
  "good",
  "best",
  "gift",
  "shop",
  "shopping",
]);

export type WhyThis = {
  productId: string;
  facts: string[];
};

export type BuyerTurnResult = {
  intro: string;
  products: Product[];
  why: WhyThis[];
  followUp: boolean;
};

function lastUserText(messages: ChatMessage[]): string {
  const users = messages.filter((message) => message.role === "user");
  return users.at(-1)?.text.trim() ?? "";
}

function followUpAlreadyAsked(messages: ChatMessage[]): boolean {
  return messages.some((message) => message.role === "assistant" && message.followUp);
}

function matchCategory(raw: string | null | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  const needle = raw.toLowerCase().trim();
  return getCategories().find((category) => {
    const c = category.toLowerCase();
    return (
      c === needle ||
      c.includes(needle) ||
      needle.includes(c) ||
      `${needle}s` === c ||
      needle === `${c.replace(/s$/, "")}`
    );
  });
}

function enoughToSearch(userText: string, category?: string): boolean {
  if (category) {
    return true;
  }
  const tokens = parseSearchQuery(userText).tokens.filter(
    (token) => !FILLER.has(token),
  );
  return tokens.length > 0;
}

function eligibleProducts(input: {
  userText: string;
  category?: string;
  budget?: number;
}): Product[] {
  const parsed = parseSearchQuery(input.userText);
  const maxPrice =
    input.budget != null && parsed.maxPrice != null
      ? Math.min(input.budget, parsed.maxPrice)
      : (input.budget ?? parsed.maxPrice);

  const found = searchProducts({
    query: input.userText,
    category: input.category,
    maxPrice,
    inStock: true,
  });

  return found
    .filter((product) => product.stock > 0)
    .filter((product) => maxPrice == null || product.price_inr <= maxPrice)
    .sort((a, b) => b.rating - a.rating || a.price_inr - b.price_inr)
    .slice(0, MAX_RECOMMENDATIONS);
}

function validateSelection(
  serverIds: string[],
  requestedIds: string[],
): string[] {
  const allowed = new Set(serverIds);
  const picked = requestedIds.filter((id) => allowed.has(id)).slice(0, MAX_RECOMMENDATIONS);
  return picked.length > 0 ? picked : serverIds;
}

function sanitizeIntro(intro: string): string {
  const fallback =
    "Here are catalog matches that are in stock and within your stated constraints.";
  if (/\d{3,}/.test(intro) || /₹/.test(intro)) {
    return fallback;
  }
  return intro;
}

async function extractIntent(messages: ChatMessage[]) {
  const categories = getCategories();
  const raw = await generateJson(
    JSON.stringify({
      categories,
      conversation: messages.map((message) => ({
        role: message.role,
        text: message.text,
      })),
    }),
    `You extract shopping intent from a buyer conversation for a consumer-electronics catalog.
Return JSON only with keys: category, budget, preferences, usage, constraints, query, needsFollowUp, followUpQuestion.
- category: one of the provided catalog categories, or null.
- budget: INR number if the buyer stated a ceiling, else null. Never invent a budget.
- preferences and constraints: short strings from the buyer, else [].
- query: keywords useful for catalog search, else "".
- needsFollowUp: true only if you cannot search (no product type and no usable keywords).
- followUpQuestion: at most one short question, only when needsFollowUp is true.
Do not invent prices, stock, specs, or product names.`,
  );
  return intentSchema.safeParse(raw);
}

async function phraseRecommendations(serverPicked: Product[]) {
  const raw = await generateJson(
    JSON.stringify({
      products: serverPicked.map(compactCatalogRow),
    }),
    `You write a short shopping intro for catalog products already selected by the server.
Return JSON only with keys: intro, selectedProductIds, reasonKeys.
- intro: 1-2 sentences. Do not mention prices, stock, ratings, specs, or product claims.
- selectedProductIds: subset of the provided ids, max 3, same ids only.
- reasonKeys: map of id -> subset of ["price","stock","rating","brand","spec"].
Do not add ids. Do not invent product facts.`,
  );
  return phraseSchema.safeParse(raw);
}

function buildWhy(
  products: Product[],
  reasonKeys: Record<string, ReasonKey[]> | undefined,
  budget?: number,
): WhyThis[] {
  return products.map((product) => ({
    productId: product.id,
    facts: reasonFacts(product, reasonKeys?.[product.id] ?? [], budget),
  }));
}

export async function runBuyerTurn(input: {
  sessionId: string;
  messages: ChatMessage[];
}): Promise<BuyerTurnResult> {
  const userText = lastUserText(input.messages);
  const alreadyAsked = followUpAlreadyAsked(input.messages);

  await recordBuyerEvent({
    sessionId: input.sessionId,
    timestamp: new Date().toISOString(),
    type: "message",
  });

  let intent: Intent | null = null;
  try {
    const parsedIntent = await extractIntent(input.messages);
    if (parsedIntent.success) {
      intent = parsedIntent.data;
    }
  } catch {
    intent = null;
  }
  const parsedQuery = parseSearchQuery(userText);
  const category = matchCategory(intent?.category);
  const budget = parsedQuery.maxPrice ?? intent?.budget ?? undefined;
  const canSearch = enoughToSearch(userText, category);

  await recordBuyerEvent({
    sessionId: input.sessionId,
    timestamp: new Date().toISOString(),
    type: "intent",
    constraints: {
      category,
      budget,
      inStock: true,
    },
  });

  if (!canSearch && !alreadyAsked) {
    const question =
      intent?.followUpQuestion?.trim() ||
      "What kind of product are you looking for, such as a laptop, headphones, or a monitor?";
    await recordBuyerEvent({
      sessionId: input.sessionId,
      timestamp: new Date().toISOString(),
      type: "follow_up",
      followUp: true,
    });
    return {
      intro: question,
      products: [],
      why: [],
      followUp: true,
    };
  }

  if (!canSearch && alreadyAsked) {
    return {
      intro:
        "I still need a product type from the catalog, such as a laptop, headphones, or a monitor.",
      products: [],
      why: [],
      followUp: false,
    };
  }

  const serverPicked = eligibleProducts({
    userText,
    category,
    budget,
  });

  if (serverPicked.length === 0) {
    return {
      intro:
        "No in-stock catalog products match those constraints. You can browse the full catalog or try a broader description.",
      products: [],
      why: [],
      followUp: false,
    };
  }

  let phrased: ReturnType<typeof phraseSchema.safeParse> | null = null;
  try {
    phrased = await phraseRecommendations(serverPicked);
  } catch {
    phrased = null;
  }
  const selectedIds =
    phrased?.success
      ? validateSelection(
          serverPicked.map((product) => product.id),
          phrased.data.selectedProductIds,
        )
      : serverPicked.map((product) => product.id);
  const products = getProductDetails(selectedIds).filter((product) =>
    serverPicked.some((row) => row.id === product.id),
  );
  const ordered = selectedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => product != null);

  const intro = sanitizeIntro(
    phrased?.success
      ? phrased.data.intro?.trim() ||
        "Here are catalog matches that are in stock and within your stated constraints."
      : "Here are catalog matches that are in stock and within your stated constraints.",
  );

  const why = buildWhy(
    ordered,
    phrased?.success ? phrased.data.reasonKeys : undefined,
    budget,
  );

  await recordBuyerEvent({
    sessionId: input.sessionId,
    timestamp: new Date().toISOString(),
    type: "recommendation",
    productIds: ordered.map((product) => product.id),
    constraints: {
      category,
      budget,
      inStock: true,
    },
  });

  return {
    intro,
    products: ordered,
    why,
    followUp: false,
  };
}
