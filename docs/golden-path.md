# Golden-path user journey

Written target journey for the hackathon demo. **Catalog search and the AI buyer chat are implemented through Phase 2.** Later steps stay documented for later phases.

## Story

Meera (home-office professional) needs a 27-inch USB-C monitor under ₹20,000 that is in stock.

1. **Buyer need** — Meera describes: “I need a USB-C monitor under ₹20,000 for my laptop desk, in stock this week.”
2. **Intent and constraints** *(Phase 2)* — The assistant extracts category `monitors`, budget `20000`, preference `USB-C`, constraint `in stock`. It asks at most one follow-up only if something essential is missing.
3. **Catalog search and comparison** *(Phase 1–2)* — Trusted catalog tools return in-stock monitors at or below budget. The assistant recommends up to three products with reasons from retrieved facts (price, rating, specs). It never invents stock or price.
4. **Buyer selects a product** — Meera explicitly chooses ClearView 27-inch Monitor (₹18,990, 9 in stock). The agent does not add it to a cart on her behalf.
5. **One optional add-on** *(Phase 4)* — After that selection, at most one compatible in-stock add-on within remaining budget (for example TrackFlow Wireless Mouse) is offered with an explainable reason. Meera can decline; “no add-ons” stops further offers in the session.
6. **Cart confirmation** *(Phase 5)* — Meera reviews the cart and confirms. Totals are computed server-side from catalog prices, not from the browser.
7. **Razorpay Test Mode checkout** *(Phase 5)* — A fresh Razorpay order is created server-side. She pays with Test Mode cards. Signature and webhook verification update order state. No live payments.
8. **Merchant analytics** *(Phase 3, 5, 6)* — The merchant console shows the search, recommendation, add-to-cart, payment success, and an audit trace of the journey.

## Phase 2 slice

Today a developer can:

1. Browse and search the catalog without Gemini.
2. Open **Assistant** and ask `laptop under ₹80,000 with 16 GB RAM`.
3. See at most three in-stock, in-budget catalog cards with a **Why this?** panel built from seed fields.
4. Click through to a product detail page. Nothing is added to a cart.
