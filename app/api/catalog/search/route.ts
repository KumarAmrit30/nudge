import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";
import {
  parseBooleanParam,
  parseNumberParam,
  parseStringParam,
} from "@/lib/query-params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = parseStringParam(params.get("query") ?? params.get("q") ?? undefined);
  const inStock = parseBooleanParam(params.get("inStock") ?? undefined);
  const products = searchProducts({
    query,
    category: parseStringParam(params.get("category") ?? undefined),
    brand: parseStringParam(params.get("brand") ?? undefined),
    maxPrice: parseNumberParam(params.get("maxPrice") ?? undefined),
    minRating: parseNumberParam(params.get("minRating") ?? undefined),
    inStock: inStock ?? (query ? true : undefined),
  });

  return NextResponse.json({ products });
}
