import { NextResponse } from "next/server";
import { resetToSeed } from "@/lib/merchant-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await resetToSeed();
  return NextResponse.redirect(new URL("/merchant", request.url), 303);
}
