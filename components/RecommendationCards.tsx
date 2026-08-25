"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatInr, stockLabel } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";

export type WhyThis = {
  productId: string;
  facts: string[];
};

export function RecommendationCards({
  products,
  why,
}: {
  products: Product[];
  why: WhyThis[];
}) {
  if (products.length === 0) {
    return null;
  }

  const whyById = new Map(why.map((item) => [item.productId, item.facts]));

  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
      {products.map((product) => {
        const facts = whyById.get(product.id) ?? [];
        return (
          <li
            key={product.id}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
          >
            <Link href={`/products/${product.id}`} className="block">
              <div className="aspect-[4/3] bg-zinc-100">
                <ProductImage
                  src={product.image_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {product.brand}
                </p>
                <h3 className="mt-1 text-base font-semibold text-zinc-900">
                  {product.title}
                </h3>
                <p className="mt-2 font-semibold text-zinc-900">
                  {formatInr(product.price_inr)}
                </p>
                <p
                  className={
                    product.stock > 0
                      ? "text-sm text-emerald-700"
                      : "text-sm text-red-700"
                  }
                >
                  {stockLabel(product.stock)}
                </p>
              </div>
            </Link>
            {facts.length > 0 ? (
              <details className="border-t border-zinc-200 px-4 py-3">
                <summary className="cursor-pointer text-sm font-medium text-zinc-800">
                  Why this?
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                  {facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
