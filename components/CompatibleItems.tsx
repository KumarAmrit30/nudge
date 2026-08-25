import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatInr, stockLabel } from "@/lib/format";

export function CompatibleItems({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-zinc-900">Compatible items</h2>
      <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
        {products.map((product) => (
          <li key={product.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <Link
              href={`/products/${product.id}`}
              className="font-medium text-zinc-900 hover:underline"
            >
              {product.title}
            </Link>
            <p className="text-sm text-zinc-600">
              {formatInr(product.price_inr)} · {stockLabel(product.stock)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
