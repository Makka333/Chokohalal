import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { offerUpdateSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const payload = offerUpdateSchema.parse(await request.json());
    const before = await prisma.offer.findUniqueOrThrow({ where: { id } });
    const offer = await prisma.offer.update({
      where: { id },
      data: payload,
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.adminId,
        action: "OFFER_SETTINGS_CHANGED",
        object: {
          offerId: id,
          oldValue: {
            minAmount: before.minAmount.toString(),
            maxAmount: before.maxAmount.toString(),
            availableTerms: before.availableTerms,
            downPaymentRule: before.downPaymentRule,
            markupRule: before.markupRule,
            status: before.status,
          },
          newValue: payload,
        },
      },
    });

    return NextResponse.json({ offer });
  } catch (error) {
    console.error("PATCH /api/offers/[id] failed", error);
    return NextResponse.json({ error: "Не удалось сохранить настройки" }, { status: 500 });
  }
}
