import { NextResponse } from "next/server";
import { importCsvText } from "@/lib/merchant-import";
import { MAX_CSV_BYTES } from "@/lib/merchant-paths";
import {
  readAssociationState,
  writeAssociationState,
  writeImportStatus,
  writeOverlayCatalog,
} from "@/lib/merchant-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToMerchant(request: Request): NextResponse {
  return NextResponse.redirect(new URL("/merchant", request.url), 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    await writeImportStatus({
      timestamp: new Date().toISOString(),
      ok: false,
      acceptedCount: 0,
      errors: [{ row: 1, field: "file", message: "Choose a CSV file to import." }],
    });
    return redirectToMerchant(request);
  }

  if (file.size > MAX_CSV_BYTES) {
    await writeImportStatus({
      timestamp: new Date().toISOString(),
      ok: false,
      acceptedCount: 0,
      errors: [
        {
          row: 1,
          field: "file",
          message: `File is larger than ${MAX_CSV_BYTES} bytes.`,
        },
      ],
    });
    return redirectToMerchant(request);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = buffer.toString("utf8");
  const result = importCsvText(text, buffer.byteLength);
  const timestamp = new Date().toISOString();

  if (!result.ok) {
    await writeImportStatus({
      timestamp,
      ok: false,
      acceptedCount: 0,
      errors: result.errors,
    });
    return redirectToMerchant(request);
  }

  await writeOverlayCatalog(result.products);
  const state = await readAssociationState();
  const dismissedKeys = new Set(
    state.dismissed.map((pair) => `${pair.fromSku}\u0000${pair.toSku}`),
  );
  state.pendingCsv = result.pendingCsv.filter(
    (pair) => !dismissedKeys.has(`${pair.fromSku}\u0000${pair.toSku}`),
  );
  await writeAssociationState(state);
  await writeImportStatus({
    timestamp,
    ok: true,
    acceptedCount: result.acceptedCount,
    errors: [],
  });
  return redirectToMerchant(request);
}
