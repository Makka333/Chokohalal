import { NextResponse } from "next/server";
import { getActiveOffers } from "@/lib/offers";

export async function GET() {
  try {
    const offers = await getActiveOffers();
    return NextResponse.json({ offers });
  } catch (error) {
    console.error("GET /api/offers failed", error);
    return NextResponse.json({ error: "Не удалось получить предложения" }, { status: 500 });
  }
}
