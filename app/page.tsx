import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        For merchants
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
        An AI commerce concierge that sells from your catalog — not from guesses.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-7 text-zinc-600">
        Buyers describe what they need. Nudge searches your products, explains
        trade-offs with real prices and stock, and helps them check out. This
        Phase 1 build is a searchable catalog: filter seeded products and open
        a detail page.
      </p>
      <div className="mt-10">
        <Link
          href="/products"
          className="inline-flex items-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Browse products
        </Link>
      </div>
      <ul className="mt-16 grid gap-6 sm:grid-cols-3">
        <li className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900">Trusted catalog</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Prices, stock, and specs come from committed seed data — never invented
            in the browser.
          </p>
        </li>
        <li className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900">Buyer journey</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Natural-language shopping, one optional add-on, and Razorpay Test Mode
            checkout are planned for later phases.
          </p>
        </li>
        <li className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold text-zinc-900">Merchant view</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Catalog readiness and conversion analytics are deferred until the
            merchant console phase.
          </p>
        </li>
      </ul>
    </div>
  );
}
