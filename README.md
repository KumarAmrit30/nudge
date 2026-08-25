# Nudge — AI Growth & Agentic Commerce

Hackathon-ready AI commerce concierge for merchants. This repository is at **Phase 1: catalog and deterministic search**.

A buyer will later describe a need in natural language. The agent will search this trusted merchant catalog, recommend products with data-grounded reasons, take explicit cart confirmation, and complete Razorpay Test Mode checkout. Phase 1 is a searchable local catalog with no LLM.

## Setup

1. **Node.js 20+** and npm.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment placeholders (optional; the app runs without these values):

   ```bash
   cp .env.example .env.local
   ```

   Do not put real API keys in git. `.env.example` lists names only.

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). Browse [Products](http://localhost:3000/products). Try:

   `laptop under ₹80,000 with 16 GB RAM`

## Architecture (Phase 1)

```text
Browser
  → Next.js pages and GET /api/catalog/*
  → searchProducts / getProductDetails / getCompatibleAddOns
  → data/products.json  (committed seed; only runtime source of truth)
```

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Catalog:** Static JSON in `data/products.json` (~50–100 electronics products). Prices, stock, specs, and compatible SKUs come from this file only. The app does not call DummyJSON at runtime.
- **Search:** Deterministic keyword + filters in `lib/search.ts` (no search library, no LLM). Filters: category, price ceiling, in-stock, rating, brand. The query parser reads phrases such as `under ₹80,000` and `16 GB RAM`.
- **Tools:** `searchProducts`, `getProductDetails`, `getCompatibleAddOns` in `lib/catalog.ts`, also exposed as GET `/api/catalog/search`, `/api/catalog/products?ids=`, `/api/catalog/addons`.
- **Env:** Next.js `process.env`. Razorpay Test Mode variable names are reserved in `.env.example`. Checkout is not implemented.
- **Not in this phase:** database, LLM, cart, payments, merchant dashboard, auth, vector search.

See [docs/personas.md](docs/personas.md) and [docs/golden-path.md](docs/golden-path.md). Deferred work lives in [TODO.md](TODO.md).

## Scripts

| Command        | Purpose              |
|----------------|----------------------|
| `npm run dev`  | Local development    |
| `npm run build`| Production build     |
| `npm run lint` | ESLint               |

`data/products.json` is the only runtime catalog. `scripts/import-catalog.mjs` is an optional offline helper to regenerate that file from DummyJSON plus curated SKUs. It is **not** part of `npm run dev`, `npm run build`, or the demo. USD prices in DummyJSON were converted at a fixed **83 INR per USD**.

## Phase 1 scope

Implemented: local 50–100 product catalog, keyword search and filters, compatible-item links, trusted catalog tools.

Not implemented: conversational AI, cart, merchant console, CSV import, upsell agent, Razorpay checkout, analytics, deployment.
