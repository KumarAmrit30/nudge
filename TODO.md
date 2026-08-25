# TODO

## Deferred ideas

- **Supabase/Postgres** as the catalog or event store. Phase 3 still uses a gitignored JSON overlay plus local JSONL. Earliest real need: order/payment state (Phase 5).
- **Durable event storage.** `data/events/*.jsonl` is local-dev recording only, not deployment persistence. Revisit when Phase 5 orders need durable logs.
- **Optional single upsell after explicit product selection**, with deterministic eligibility and session-level “no add-ons”. Compatible SKUs exist in the catalog but are not an upsell offer. **Phase 4.**
- **Buyer cart, Razorpay Test Mode checkout, order/payment verification, webhooks.** **Phase 5.**
- **Razorpay SDK / Checkout script / webhook tooling.** `.env.example` only reserves key names. **Phase 5.**
- **Evaluation suite, audit traces, safety guardrails, evaluation results view.** Prompts exist; the runner/report is **Phase 6.**
- **Public deployment, demo seed hardening, scripted live demo, backup recording.** **Phase 7.**
- **`next/image` remote patterns** for product photos. Ordinary `<img>` is enough. **Phase 7.**
- **Fully local product photos.** Some seed images still point at the DummyJSON CDN. **Phase 7.**
- **Authentication, Redis, queues, Docker, analytics SaaS, Shopify/WooCommerce connectors.** Not on the frozen hackathon roadmap.
- **Vector / semantic search (pgvector).** Explicitly not part of the frozen roadmap.

Out-of-scope ideas noticed during Phase 3 (not implemented):

- **Streaming chat tokens.** Request/response is enough. **Phase 7** if the live demo needs it.
- **Wiring `scripts/import-catalog.mjs` into npm scripts.** Must stay optional. **Phase 7** at earliest.
- **Client-side live filtering without a form submit.** **Phase 7.**
- **CSV parsing npm package.** In-repo RFC4180 parser plus Zod row validation covers the committed samples.
