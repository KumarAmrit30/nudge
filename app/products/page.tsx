import { CatalogSearchForm } from "@/components/CatalogSearchForm";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, searchProducts } from "@/lib/catalog";
import {
  parseBooleanParam,
  parseNumberParam,
  parseStringParam,
} from "@/lib/query-params";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = parseStringParam(params.q);
  const category = parseStringParam(params.category);
  const brand = parseStringParam(params.brand);
  const maxPrice = parseNumberParam(params.maxPrice);
  const minRating = parseNumberParam(params.minRating);
  const inStockParam = parseBooleanParam(params.inStock);
  const hasFilters = Boolean(
    query || category || brand || maxPrice != null || minRating != null || inStockParam != null,
  );
  const inStock = inStockParam ?? (query ? true : undefined);

  const products = hasFilters
    ? searchProducts({
        query,
        category,
        brand,
        maxPrice,
        minRating,
        inStock,
      })
    : getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Products
      </h1>
      <p className="mt-2 text-zinc-600">
        Seeded catalog for the demo merchant. Prices and stock are from local
        product data.
      </p>
      <CatalogSearchForm
        q={query ?? ""}
        category={category ?? ""}
        brand={brand ?? ""}
        maxPrice={maxPrice != null ? String(maxPrice) : ""}
        minRating={minRating != null ? String(minRating) : ""}
        inStock={inStockParam ?? true}
      />
      <p className="mt-6 text-sm text-zinc-600">
        {products.length} product{products.length === 1 ? "" : "s"}
      </p>
      {products.length === 0 ? (
        <p className="mt-8 text-zinc-600">No products match these filters.</p>
      ) : (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
