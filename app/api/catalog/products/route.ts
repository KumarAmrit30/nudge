import { NextRequest, NextResponse } from "next/server";
import { getProductDetails } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const productIds = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return NextResponse.json({ products: getProductDetails(productIds) });
}
