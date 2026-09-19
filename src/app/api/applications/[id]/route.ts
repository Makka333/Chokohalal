import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { applicationStatusSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: { calculation: true, offer: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("GET /api/applications/[id] failed", error);
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const payload = applicationStatusSchema.parse(await request.json());
    const before = await prisma.application.findUniqueOrThrow({ where: { id } });
    const application = await prisma.application.update({
      where: { id },
      data: { status: payload.status },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.adminId,
        action: "APPLICATION_STATUS_CHANGED",
        object: {
          applicationId: id,
          oldValue: before.status,
          newValue: payload.status,
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("PATCH /api/applications/[id] failed", error);
    return NextResponse.json({ error: "Не удалось изменить статус" }, { status: 500 });
  }
}
