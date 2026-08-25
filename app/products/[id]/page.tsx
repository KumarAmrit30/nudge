import { notFound } from "next/navigation";
import Link from "next/link";
import { CompatibleItems } from "@/components/CompatibleItems";
import { ProductImage } from "@/components/ProductImage";
import { getCompatibleAddOns, getProductById } from "@/lib/catalog";
import { formatInr, stockLabel } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const inStock = product.stock > 0;
  const specEntries = Object.entries(product.specifications);
  const compatibleItems = getCompatibleAddOns({ productId: product.id });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/products" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
        ← All products
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          <ProductImage
            src={product.image_url}
            alt={product.title}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            {product.brand} · {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {product.title}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-zinc-900">
            {formatInr(product.price_inr)}
          </p>
          <p className={`mt-2 text-sm ${inStock ? "text-emerald-700" : "text-red-700"}`}>
            {stockLabel(product.stock)}
          </p>
          <p className="mt-6 leading-7 text-zinc-600">{product.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">SKU</dt>
              <dd className="font-medium text-zinc-900">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Rating</dt>
              <dd className="font-medium text-zinc-900">{product.rating} / 5</dd>
            </div>
          </dl>
          {specEntries.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Specifications
              </h2>
              <dl className="mt-3 divide-y divide-zinc-200 border-y border-zinc-200">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 py-2 text-sm">
                    <dt className="capitalize text-zinc-500">{key.replaceAll("_", " ")}</dt>
                    <dd className="font-medium text-zinc-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          {product.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <CompatibleItems products={compatibleItems} />
    </div>
  );
}
