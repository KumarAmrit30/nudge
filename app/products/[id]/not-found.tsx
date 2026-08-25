import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Product not found</h1>
      <p className="mt-2 text-zinc-600">That item is not in the seeded catalog.</p>
      <Link
        href="/products"
        className="mt-6 inline-flex text-sm font-medium text-zinc-900 underline"
      >
        Back to products
      </Link>
    </div>
  );
}
