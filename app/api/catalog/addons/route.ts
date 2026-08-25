import { NextRequest, NextResponse } from "next/server";
import { getCompatibleAddOns } from "@/lib/catalog";
import { parseNumberParam, parseStringParam } from "@/lib/query-params";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const productId = parseStringParam(params.get("productId") ?? undefined);
  if (!productId) {
    return NextResponse.json({ products: [] });
  }

  return NextResponse.json({
    products: getCompatibleAddOns({
      productId,
      budget: parseNumberParam(params.get("budget") ?? undefined),
    }),
  });
}
