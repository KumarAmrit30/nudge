# Nudge — AI Growth & Agentic Commerce

Hackathon-ready AI commerce concierge for merchants. This repository is at **Phase 3: Merchant AI-commerce layer**.

A buyer describes a need in natural language. The assistant extracts intent, searches the trusted merchant catalog, and recommends up to three in-stock products that fit a stated budget. Merchants can import a CSV overlay, review catalog readiness and suggested associations, and see local-dev analytics. Product facts come from catalog data, not from the model. Cart, upsell, and Razorpay checkout are later phases.

## Setup

1. **Node.js 20+** and npm.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment placeholders:

   ```bash
   cp .env.example .env.local
   ```

   For the chat assistant, set `GEMINI_API_KEY` in `.env.local` (server-side only). Leave it empty to use browse/search and the merchant console without the assistant. Optional: `GEMINI_MODEL=gemini-2.5-flash`.

   Do not put real API keys in git. `.env.example` lists names only.

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).
   - Catalog: [Products](http://localhost:3000/products) — works without Gemini.
   - Chat: [Assistant](http://localhost:3000/buy) — requires `GEMINI_API_KEY`.
   - Merchant: [Merchant](http://localhost:3000/merchant) — unauthenticated demo console.
   - Try: `laptop under ₹80,000 with 16 GB RAM`

## Architecture (Phase 3)

```text
Browser
  → /products          → searchProducts (no LLM)
       Search submit   → POST /api/events/search (records search, then redirects)
  → /buy               → POST /api/buyer/chat
  → /merchant          → CSV import, readiness, association review, analytics
       POST /api/merchant/import   (Node.js, in-repo CSV parse, then Zod)
       POST /api/merchant/reset    (deletes overlay + association state)
  Catalog source: data/merchant-catalog.json if present, else data/products.json
```

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Catalog:** Committed `data/products.json` is the seed. Runtime import writes a gitignored overlay. Runtime never calls DummyJSON. Disk reads and writes run in the Node.js runtime only.
- **LLM:** `@google/genai` on the server only. Default model `gemini-2.5-flash`.
- **Events:** JSONL under `data/events/` for **local development only**. Gitignored. Not durable deployment storage.
- **Eval prompts:** `data/evaluation-prompts.json`. No results dashboard yet (Phase 6).

See [docs/personas.md](docs/personas.md) and [docs/golden-path.md](docs/golden-path.md). Deferred work lives in [TODO.md](TODO.md).

## Merchant CSV import

Required columns:

```text
sku, title, description, category, price_inr, stock,
image_url, brand, tags, specifications, compatible_skus
```

- `tags` and `compatible_skus` are pipe-separated (`mouse|usb-c`).
- `specifications` is a JSON object string, for example `{"ram":"16 GB"}`. Empty is allowed.
- `rating` is not a CSV column. Imported rows get `rating: 0`.
- `compatible_skus` in the file become **suggested associations**. They are not written onto products until you accept them in the console.
- The whole file is rejected if any row fails. The overlay is left unchanged. Row errors are listed (row, field, message).
- Uploads are capped at 256 KB and 500 data rows before parsing.
- Samples (quoted commas and escaped quotes): [data/samples/catalog-valid.csv](data/samples/catalog-valid.csv), [data/samples/catalog-invalid.csv](data/samples/catalog-invalid.csv).

**Reset to seed** deletes `data/merchant-catalog.json` and `data/merchant-association-state.json`. It never modifies committed `data/products.json`.

Search analytics are recorded only from the catalog **Search** submit (`POST /api/events/search`). Reloading `/products` does not write a search event. Add-to-cart and payment-success counts stay 0 until Phase 5.

## Scripts

| Command        | Purpose              |
|----------------|----------------------|
| `npm run dev`  | Local development    |
| `npm run build`| Production build     |
| `npm run lint` | ESLint               |

`scripts/import-catalog.mjs` remains optional and is not part of `npm run dev` or `npm run build`.

## Phase 3 scope

Implemented: merchant console, CSV import with validation and status, catalog readiness, reviewed association suggestions, local search/recommendation analytics.

Not implemented: cart, upsell agent, Razorpay checkout, store connectors, auth, durable event storage, deployment.
