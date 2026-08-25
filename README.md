# Nudge — AI Growth & Agentic Commerce

Hackathon-ready AI commerce concierge for merchants. This repository is at **Phase 2: AI buyer MVP**.

A buyer describes a need in natural language. The assistant extracts intent, searches the trusted merchant catalog, and recommends up to three in-stock products that fit a stated budget. Product facts come from seed data, not from the model. Cart, upsell, and Razorpay checkout are later phases.

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

   For the chat assistant, set `GEMINI_API_KEY` in `.env.local` (server-side only). Leave it empty to use browse/search without the assistant. Optional: `GEMINI_MODEL=gemini-2.5-flash`.

   Do not put real API keys in git. `.env.example` lists names only.

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).
   - Catalog: [Products](http://localhost:3000/products) — works without Gemini.
   - Chat: [Assistant](http://localhost:3000/buy) — requires `GEMINI_API_KEY`.
   - Try: `laptop under ₹80,000 with 16 GB RAM`

## Architecture (Phase 2)

```text
Browser
  → /products  → searchProducts (no LLM)
  → /buy       → POST /api/buyer/chat
       → Gemini intent JSON (Zod)
       → searchProducts + getProductDetails
       → server stock/budget filter, max 3
       → Gemini intro + selectedProductIds + reasonKeys (Zod)
       → cards / Why this? from catalog fields only
  → data/products.json  (catalog source of truth)
```

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Catalog:** Committed `data/products.json`. Runtime never calls DummyJSON.
- **LLM:** `@google/genai` on the server only. Default model `gemini-2.5-flash`. The model does not choose arbitrary product ids or supply prices, stock, or specs.
- **Events:** JSONL under `data/events/` for **local development only**. Gitignored. Not durable deployment storage; replace only when a later approved phase adds persistence.
- **Eval prompts:** `data/evaluation-prompts.json` (20–30 fixed prompts). No results dashboard yet (Phase 6).

See [docs/personas.md](docs/personas.md) and [docs/golden-path.md](docs/golden-path.md). Deferred work lives in [TODO.md](TODO.md).

## Scripts

| Command        | Purpose              |
|----------------|----------------------|
| `npm run dev`  | Local development    |
| `npm run build`| Production build     |
| `npm run lint` | ESLint               |

`scripts/import-catalog.mjs` remains optional and is not part of `npm run dev` or `npm run build`.

## Phase 2 scope

Implemented: chat buyer, structured intent, catalog-grounded recommendations (max 3), Why this? from seed facts, local event log, evaluation prompts.

Not implemented: cart, merchant console, CSV import, upsell agent, Razorpay checkout, analytics dashboard, deployment.
