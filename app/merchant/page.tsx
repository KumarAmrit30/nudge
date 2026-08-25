import { isOverlayActive } from "@/lib/catalog";
import { getMerchantAnalytics } from "@/lib/merchant-analytics";
import { listAssociationSuggestions } from "@/lib/merchant-associations";
import { catalogReadinessIssues } from "@/lib/merchant-readiness";
import { readImportStatus } from "@/lib/merchant-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const issueLabels: Record<string, string> = {
  missing_image: "Missing image",
  invalid_price: "Invalid price",
  missing_stock: "Missing stock",
  blank_description: "Blank description",
  empty_tags: "Empty tags",
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default async function MerchantPage() {
  const [status, issues, suggestions, analytics] = await Promise.all([
    readImportStatus(),
    Promise.resolve(catalogReadinessIssues()),
    listAssociationSuggestions(),
    getMerchantAnalytics(),
  ]);
  const overlay = isOverlayActive();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Merchant
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-600">
        Demo console for this store. No login. CSV import writes a local overlay
        and never changes committed seed data. Cart and payments are not in this
        phase.
      </p>
      <p className="mt-3 text-sm text-zinc-600">
        Catalog source:{" "}
        <span className="font-medium text-zinc-900">
          {overlay ? "merchant overlay" : "committed seed"}
        </span>
      </p>

      <section id="import" className="mt-10 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">CSV import</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Required columns: sku, title, description, category, price_inr, stock,
          image_url, brand, tags, specifications, compatible_skus. Tags and
          compatible SKUs are pipe-separated. Specifications is a JSON object
          string. Rating is not a CSV column and defaults to 0. Compatible SKUs
          become association suggestions; they are not applied until you accept
          them. Invalid files leave the catalog unchanged.
        </p>
        <form
          action="/api/merchant/import"
          method="post"
          encType="multipart/form-data"
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700">CSV file</span>
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="text-zinc-900"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Import
          </button>
        </form>
        {status ? (
          <div className="mt-4 text-sm">
            <p className={status.ok ? "text-emerald-700" : "text-red-700"}>
              Last import {formatTimestamp(status.timestamp)}
              {status.ok
                ? ` — accepted ${status.acceptedCount} row${status.acceptedCount === 1 ? "" : "s"}.`
                : " — rejected. Catalog unchanged."}
            </p>
            {status.errors.length > 0 ? (
              <table className="mt-3 w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2 pr-3 font-medium">Row</th>
                    <th className="py-2 pr-3 font-medium">Field</th>
                    <th className="py-2 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {status.errors.map((error) => (
                    <tr
                      key={`${error.row}-${error.field}-${error.message}`}
                      className="border-b border-zinc-100"
                    >
                      <td className="py-2 pr-3 text-zinc-900">{error.row}</td>
                      <td className="py-2 pr-3 text-zinc-900">{error.field}</td>
                      <td className="py-2 text-zinc-700">{error.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">No import has been run yet.</p>
        )}
        <p className="mt-4 text-xs text-zinc-500">
          Sample files: data/samples/catalog-valid.csv and
          data/samples/catalog-invalid.csv.
        </p>
      </section>

      <section id="readiness" className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">Catalog readiness</h2>
        <p className="mt-2 text-sm text-zinc-600">
          {issues.length} issue{issues.length === 1 ? "" : "s"} on the current
          catalog.
        </p>
        {issues.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No readiness gaps found.</p>
        ) : (
          <table className="mt-4 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2 pr-3 font-medium">SKU</th>
                <th className="py-2 font-medium">Issue</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr
                  key={`${issue.sku}-${issue.issue}`}
                  className="border-b border-zinc-100"
                >
                  <td className="py-2 pr-3 font-medium text-zinc-900">{issue.sku}</td>
                  <td className="py-2 text-zinc-700">
                    {issueLabels[issue.issue] ?? issue.issue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section id="associations" className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Suggested associations
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Suggestions are not applied automatically. Accept writes compatible
          SKUs on the local overlay only. Dismiss hides the pair in local
          association state.
        </p>
        {suggestions.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No pending suggestions.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {suggestions.map((suggestion) => (
              <li
                key={`${suggestion.fromSku}-${suggestion.toSku}-${suggestion.reason}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <p className="text-sm text-zinc-800">
                  <span className="font-medium">{suggestion.fromSku}</span>
                  {" → "}
                  <span className="font-medium">{suggestion.toSku}</span>
                  <span className="ml-2 text-xs uppercase tracking-wide text-zinc-500">
                    {suggestion.reason}
                  </span>
                </p>
                <form
                  action="/api/merchant/associations"
                  method="post"
                  className="flex gap-2"
                >
                  <input type="hidden" name="fromSku" value={suggestion.fromSku} />
                  <input type="hidden" name="toSku" value={suggestion.toSku} />
                  <button
                    type="submit"
                    name="intent"
                    value="accept"
                    className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
                  >
                    Accept
                  </button>
                  <button
                    type="submit"
                    name="intent"
                    value="dismiss"
                    className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                  >
                    Dismiss
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="analytics" className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">Analytics</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Counts come from local JSONL under data/events/. This is development
          logging only, not deployment storage. Search events are recorded only
          when the catalog Search button is submitted.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Searches
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {analytics.searches}
            </dd>
          </div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Recommended products
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {analytics.recommendedCount}
            </dd>
          </div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Add to cart
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {analytics.addToCart}
            </dd>
            <p className="mt-1 text-xs text-zinc-500">Starts in Phase 5.</p>
          </div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Payment success
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-900">
              {analytics.paymentSuccess}
            </dd>
            <p className="mt-1 text-xs text-zinc-500">Starts in Phase 5.</p>
          </div>
        </dl>
        {analytics.recommendedTop.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-zinc-800">Top recommended ids</h3>
            <ul className="mt-2 text-sm text-zinc-700">
              {analytics.recommendedTop.map((row) => (
                <li key={row.productId}>
                  {row.productId} ({row.count})
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">Reset to seed</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Deletes the local catalog overlay and dismissed-association state. Does
          not modify data/products.json.
        </p>
        <form action="/api/merchant/reset" method="post" className="mt-4">
          <button
            type="submit"
            className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Reset to seed
          </button>
        </form>
      </section>
    </div>
  );
}
