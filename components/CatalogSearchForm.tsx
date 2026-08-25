import Link from "next/link";
import { getBrands, getCategories } from "@/lib/catalog";

type CatalogSearchFormProps = {
  q?: string;
  category?: string;
  brand?: string;
  maxPrice?: string;
  minRating?: string;
  inStock: boolean;
};

export function CatalogSearchForm({
  q = "",
  category = "",
  brand = "",
  maxPrice = "",
  minRating = "",
  inStock,
}: CatalogSearchFormProps) {
  const categories = getCategories();
  const brands = getBrands();

  return (
    <form
      method="get"
      action="/products"
      className="mt-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <label className="flex flex-col gap-1 text-sm lg:col-span-3">
        <span className="font-medium text-zinc-700">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder='e.g. laptop under ₹80,000 with 16 GB RAM'
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Category</span>
        <select
          name="category"
          defaultValue={category}
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        >
          <option value="">All categories</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Brand</span>
        <select
          name="brand"
          defaultValue={brand}
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        >
          <option value="">All brands</option>
          {brands.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Max price (INR)</span>
        <input
          type="number"
          name="maxPrice"
          min={0}
          step={1}
          defaultValue={maxPrice}
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Min rating</span>
        <input
          type="number"
          name="minRating"
          min={0}
          max={5}
          step={0.1}
          defaultValue={minRating}
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
        />
      </label>
      <label className="flex items-center gap-2 text-sm lg:mt-7">
        <input type="hidden" name="inStock" value="0" />
        <input
          type="checkbox"
          name="inStock"
          value="1"
          defaultChecked={inStock}
          className="size-4"
        />
        <span className="font-medium text-zinc-700">In stock only</span>
      </label>
      <div className="flex items-end gap-3 lg:col-span-3">
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Search
        </button>
        <Link href="/products" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          Clear
        </Link>
      </div>
    </form>
  );
}
