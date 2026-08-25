import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatInr, stockLabel } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="aspect-[4/3] bg-zinc-100">
          <ProductImage
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {product.brand}
          </p>
          <h2 className="text-base font-semibold leading-snug text-zinc-900">
            {product.title}
          </h2>
          <p className="mt-auto text-lg font-semibold text-zinc-900">
            {formatInr(product.price_inr)}
          </p>
          <p className={inStock ? "text-sm text-emerald-700" : "text-sm text-red-700"}>
            {stockLabel(product.stock)}
          </p>
        </div>
      </Link>
    </article>
  );
}
