import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ApplicationStatusForm } from "@/components/ApplicationStatusForm";
import { PaymentSchedule } from "@/components/PaymentSchedule";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApplicationStatus, PaymentScheduleItem } from "@/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminApplicationDetailPage({ params }: PageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: { calculation: true, offer: true },
  });

  if (!application) {
    redirect("/admin/applications");
  }

  const schedule = application.calculation.paymentSchedule as PaymentScheduleItem[];

  return (
    <main className="md:flex">
      <AdminSidebar />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black text-[#0c3b2e]">Карточка заявки</h1>
            <p className="mt-2 text-[#66736d]">{application.id}</p>
          </div>
          <StatusBadge status={application.status as ApplicationStatus} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <section className="panel grid gap-3 p-5">
              <h2 className="text-xl font-black text-[#0c3b2e]">Клиент</h2>
              <p>Имя: {application.name}</p>
              <p>Телефон: {application.phone}</p>
              <p>Email: {application.email ?? "не указан"}</p>
              <p>Telegram: {application.telegram ?? "не указан"}</p>
              <p>Товар: {application.productName}</p>
              <p>Комментарий: {application.comment ?? "нет"}</p>
            </section>

            <section className="panel grid gap-3 p-5">
              <h2 className="text-xl font-black text-[#0c3b2e]">Расчёт</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <p>Цена товара: {application.calculation.productPrice.toString()} ₽</p>
                <p>Наценка: {application.calculation.markup.toString()} ₽</p>
                <p>Итоговая цена: {application.calculation.totalPrice.toString()} ₽</p>
                <p>Взнос: {application.calculation.initialPayment.toString()} ₽</p>
                <p>Срок: {application.calculation.term} мес.</p>
                <p>Платёж: {application.calculation.periodicPayment.toString()} ₽</p>
              </div>
            </section>

            <PaymentSchedule items={schedule} />
          </div>
          <ApplicationStatusForm applicationId={application.id} status={application.status as ApplicationStatus} />
        </div>
      </section>
    </main>
  );
}
