import { NextResponse } from "next/server";
import { runBuyerTurn } from "@/lib/buyer";
import { chatRequestSchema } from "@/lib/buyer-schemas";
import { hasGeminiKey } from "@/lib/gemini";

export async function POST(request: Request) {
  if (!hasGeminiKey()) {
    return NextResponse.json(
      {
        error:
          "The assistant is unavailable. You can still browse the product catalog.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
  }

  try {
    const result = await runBuyerTurn(parsed.data);
    return NextResponse.json({
      intro: result.intro,
      followUp: result.followUp,
      products: result.products,
      why: result.why,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "The assistant could not complete that turn. You can still browse the product catalog.",
      },
      { status: 502 },
    );
  }
}
