# Golden-path user journey

Written target journey for the hackathon demo. **Catalog search, the AI buyer chat, and the merchant console are implemented through Phase 3.** Later steps stay documented for later phases.

## Story

Meera (home-office professional) needs a 27-inch USB-C monitor under ₹20,000 that is in stock.

1. **Buyer need** — Meera describes: “I need a USB-C monitor under ₹20,000 for my laptop desk, in stock this week.”
2. **Intent and constraints** *(Phase 2)* — The assistant extracts category `monitors`, budget `20000`, preference `USB-C`, constraint `in stock`. It asks at most one follow-up only if something essential is missing.
3. **Catalog search and comparison** *(Phase 1–2)* — Trusted catalog tools return in-stock monitors at or below budget. The assistant recommends up to three products with reasons from retrieved facts (price, rating, specs). It never invents stock or price.
4. **Buyer selects a product** — Meera explicitly chooses ClearView 27-inch Monitor (₹18,990, 9 in stock). The agent does not add it to a cart on her behalf.
5. **One optional add-on** *(Phase 4)* — After that selection, at most one compatible in-stock add-on within remaining budget (for example TrackFlow Wireless Mouse) is offered with an explainable reason. Meera can decline; “no add-ons” stops further offers in the session.
6. **Cart confirmation** *(Phase 5)* — Meera reviews the cart and confirms. Totals are computed server-side from catalog prices, not from the browser.
7. **Razorpay Test Mode checkout** *(Phase 5)* — A fresh Razorpay order is created server-side. She pays with Test Mode cards. Signature and webhook verification update order state. No live payments.
8. **Merchant analytics** *(Phase 3, 5, 6)* — The merchant console shows searches and recommended products from local events. Add-to-cart and payment success stay at 0 until Phase 5. Audit traces arrive in Phase 6.

## Phase 3 slice

Today a developer can:

1. Browse and search the catalog without Gemini. Search submits record a local search event; reloading `/products` does not.
2. Open **Assistant** and ask `laptop under ₹80,000 with 16 GB RAM`.
3. See at most three in-stock, in-budget catalog cards with a **Why this?** panel built from catalog fields.
4. Open **Merchant**, import `data/samples/catalog-valid.csv`, see overlay products on `/products`, then **Reset to seed**.
5. Import the invalid sample and confirm the seed catalog is unchanged and row errors are listed.
