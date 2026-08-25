# Golden-path user journey

Written target journey for the hackathon demo. **Catalog browse, search, and compatible-item facts are implemented in Phase 1.** Later steps stay documented for later phases.

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

## Phase 1 slice

Today a developer can:

1. Open the landing page.
2. Go to **Products** and browse the full seeded catalog without any LLM.
3. Search `laptop under ₹80,000 with 16 GB RAM` and see only matching in-stock laptops.
4. Open a product detail page for trusted price, stock, and a **Compatible items** list (link, price, stock only).
