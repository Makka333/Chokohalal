import { NextResponse } from "next/server";
import { calculateInstallment, CalculationError } from "@/lib/calculator";
import { prisma } from "@/lib/db";
import { getOfferForCalculation } from "@/lib/offers";
import { calculationRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = calculationRequestSchema.parse(await request.json());
    const offer = await getOfferForCalculation(payload.offerId);
    const result = calculateInstallment({
      productPrice: payload.productPrice,
      term: payload.term,
      initialPayment: payload.initialPayment,
      minAmount: offer.minAmount,
      maxAmount: offer.maxAmount,
      availableTerms: offer.availableTerms,
      downPaymentRule: offer.downPaymentRule,
      markupRule: offer.markupRule,
    });

    let calculationId = crypto.randomUUID();

    if (process.env.DATABASE_URL) {
      try {
        const calculation = await prisma.calculation.create({
          data: {
            productPrice: result.productPrice,
            term: result.term,
            initialPayment: result.initialPayment,
            markup: result.markup,
            totalPrice: result.totalPrice,
            periodicPayment: result.periodicPayment,
            paymentSchedule: result.paymentSchedule,
          },
        });
        calculationId = calculation.id;
      } catch (error) {
        console.error("Calculation database is unavailable; returning the calculated result", error);
      }
    }

    return NextResponse.json({ calculationId, offerId: offer.id, result });
  } catch (error) {
    if (error instanceof CalculationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("POST /api/calculations failed", error);
    return NextResponse.json({ error: "Не удалось выполнить расчёт" }, { status: 500 });
  }
}
