# TODO

## Deferred ideas

- **Supabase/Postgres** as the catalog store. Phase 1 still uses committed JSON because search over ~100 products does not need a database. Earliest real need: merchant CSV persistence (Phase 3) or order/payment state (Phase 5).
- **Chat-based AI buyer**, structured intent extraction, recommendation cards, “Why this?” panel, conversation event recording. **Phase 2.**
- **LLM SDK/API and Zod structured-output validation**, server-side only. **Phase 2.**
- **Merchant console, CSV import/validation, catalog readiness, suggested associations, basic analytics.** **Phase 3.**
- **CSV parsing library** only if JSON.parse of a validated CSV pipeline is insufficient. **Phase 3.**
- **Optional single upsell after explicit product selection**, with deterministic eligibility and session-level “no add-ons”. Compatible SKUs exist in the catalog but are not an upsell offer. **Phase 4.**
- **Buyer cart, Razorpay Test Mode checkout, order/payment verification, webhooks.** **Phase 5.**
- **Razorpay SDK / Checkout script / webhook tooling.** `.env.example` only reserves key names. **Phase 5.**
- **Evaluation suite, audit traces, safety guardrails, evaluation results view.** **Phase 6.**
- **Public deployment, demo seed hardening, scripted live demo, backup recording.** **Phase 7.**
- **`next/image` remote patterns** for product photos. Ordinary `<img>` is enough and avoids extra image config. Reconsider only if Core Web Vitals become a Phase 7 demo issue. **Phase 7.**
- **Fully local product photos.** Some seed images still point at the DummyJSON CDN; browse and search work without that API, but photos can break offline. **Phase 7.**
- **Authentication, Redis, queues, Docker, analytics SaaS, Shopify/WooCommerce connectors.** Not on the frozen hackathon roadmap.
- **Vector / semantic search (pgvector).** Explicitly not part of the frozen roadmap.

Out-of-scope ideas noticed during Phase 1 (not implemented):

- **Wiring `scripts/import-catalog.mjs` into npm scripts.** It must stay optional so `npm run dev` / `npm run build` / the demo never depend on DummyJSON. **Phase 7** at earliest, and only if regenerating seed in CI is required.
- **Client-side live filtering without a form submit.** A GET form keeps search server-side and LLM-independent. Revisit only if the browse UX is a demo problem. **Phase 7.**
