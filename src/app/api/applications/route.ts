import { NextResponse } from "next/server";
import { calculateInstallment, CalculationError } from "@/lib/calculator";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { notifyNewApplication } from "@/lib/notifications";
import { getOfferForCalculation } from "@/lib/offers";
import { applicationRequestSchema } from "@/lib/validation";
import type { CalculationResult, PaymentScheduleItem } from "@/types";

export async function GET() {
  try {
    await requireAdmin();
    const applications = await prisma.application.findMany({
      include: { calculation: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("GET /api/applications failed", error);
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = applicationRequestSchema.parse(await request.json());

    if (payload.website) {
      return NextResponse.json({ ok: true });
    }

    const created = await prisma.$transaction(async (tx) => {
      let calculationId = payload.calculationId;
      let offerId = payload.calculation?.offerId;
      let result;

      if (!calculationId && payload.calculation) {
        const offer = await getOfferForCalculation(payload.calculation.offerId);
        offerId = offer.id;
        result = calculateInstallment({
          productPrice: payload.calculation.productPrice,
          term: payload.calculation.term,
          initialPayment: payload.calculation.initialPayment,
          minAmount: offer.minAmount,
          maxAmount: offer.maxAmount,
          availableTerms: offer.availableTerms,
          downPaymentRule: offer.downPaymentRule,
          markupRule: offer.markupRule,
        });

        const calculation = await tx.calculation.create({
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
      }

      if (!calculationId || !offerId) {
        throw new Error("Calculation is required");
      }

      const calculation = await tx.calculation.findUniqueOrThrow({ where: { id: calculationId } });
      const application = await tx.application.create({
        data: {
          name: payload.name,
          phone: payload.phone,
          email: payload.email || null,
          telegram: payload.telegram || null,
          productName: payload.productName,
          offerId,
          calculationId,
          comment: payload.comment || null,
        },
      });

      const schedule = Array.isArray(calculation.paymentSchedule)
        ? (calculation.paymentSchedule as PaymentScheduleItem[])
        : [];

      result ??= {
        productPrice: calculation.productPrice.toFixed(2),
        term: calculation.term,
        initialPayment: calculation.initialPayment.toFixed(2),
        markup: calculation.markup.toFixed(2),
        totalPrice: calculation.totalPrice.toFixed(2),
        scheduledAmount: calculation.totalPrice.minus(calculation.initialPayment).toFixed(2),
        periodicPayment: calculation.periodicPayment.toFixed(2),
        paymentCount: calculation.term,
        paymentSchedule: schedule,
        lastPaymentDiffers: schedule.length > 1 && schedule[0].amount !== schedule[schedule.length - 1].amount,
      } satisfies CalculationResult;

      return { application, result };
    });

    await notifyNewApplication({
      name: payload.name,
      phone: payload.phone,
      productName: payload.productName,
      calculation: created.result,
    });

    return NextResponse.json({ ok: true, applicationId: created.application.id });
  } catch (error) {
    if (error instanceof CalculationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("POST /api/applications failed", error);
    return NextResponse.json({ error: "Не удалось отправить заявку" }, { status: 500 });
  }
}
