import { NextResponse } from "next/server";
import { recordSearchEvent } from "@/lib/search-events";
import {
  parseBooleanParam,
  parseNumberParam,
  parseStringParam,
} from "@/lib/query-params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formValue(
  formData: FormData,
  name: string,
): string | string[] | undefined {
  const values = formData.getAll(name).map(String);
  if (values.length === 0) {
    return undefined;
  }
  if (values.length === 1) {
    return values[0];
  }
  return values;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const query = parseStringParam(formValue(formData, "q"));
  const category = parseStringParam(formValue(formData, "category"));
  const brand = parseStringParam(formValue(formData, "brand"));
  const maxPrice = parseNumberParam(formValue(formData, "maxPrice"));
  const minRating = parseNumberParam(formValue(formData, "minRating"));
  const inStock = parseBooleanParam(formValue(formData, "inStock"));

  const filters: {
    category?: string;
    brand?: string;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
  } = {};
  if (category) {
    filters.category = category;
  }
  if (brand) {
    filters.brand = brand;
  }
  if (maxPrice != null) {
    filters.maxPrice = maxPrice;
  }
  if (minRating != null) {
    filters.minRating = minRating;
  }
  if (inStock != null) {
    filters.inStock = inStock;
  }

  await recordSearchEvent({
    type: "search",
    timestamp: new Date().toISOString(),
    ...(query ? { query } : {}),
    ...(Object.keys(filters).length > 0 ? { filters } : {}),
  });

  const url = new URL("/products", request.url);
  if (query) {
    url.searchParams.set("q", query);
  }
  if (category) {
    url.searchParams.set("category", category);
  }
  if (brand) {
    url.searchParams.set("brand", brand);
  }
  if (maxPrice != null) {
    url.searchParams.set("maxPrice", String(maxPrice));
  }
  if (minRating != null) {
    url.searchParams.set("minRating", String(minRating));
  }
  if (inStock != null) {
    url.searchParams.set("inStock", inStock ? "1" : "0");
  }

  return NextResponse.redirect(url, 303);
}
