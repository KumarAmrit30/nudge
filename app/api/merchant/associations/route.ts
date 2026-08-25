import { NextResponse } from "next/server";
import {
  acceptAssociation,
  dismissAssociation,
} from "@/lib/merchant-associations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const fromSku = String(formData.get("fromSku") ?? "").trim();
  const toSku = String(formData.get("toSku") ?? "").trim();
  const intent = String(formData.get("intent") ?? "").trim();

  if (!fromSku || !toSku) {
    return NextResponse.redirect(new URL("/merchant", request.url), 303);
  }

  if (intent === "accept") {
    await acceptAssociation({ fromSku, toSku });
  } else if (intent === "dismiss") {
    await dismissAssociation({ fromSku, toSku });
  }

  return NextResponse.redirect(new URL("/merchant#associations", request.url), 303);
}
