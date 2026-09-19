import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApplicationStatus } from "@/types";

export const dynamic = "force-dynamic";

const cards: Array<{ status?: ApplicationStatus; label: string }> = [
  { label: "Все заявки" },
  { status: "NEW", label: "Новые" },
  { status: "UNDER_REVIEW", label: "На проверке" },
  { status: "APPROVED", label: "Одобренные" },
  { status: "REJECTED", label: "Отклонённые" },
  { status: "COMPLETED", label: "Завершённые" },
];

export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const counts = await Promise.all(
    cards.map((card) =>
      prisma.application.count({
        where: card.status ? { status: card.status } : undefined,
      }),
    ),
  );

  return (
    <main className="md:flex">
      <AdminSidebar />
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black text-[#0c3b2e]">Dashboard</h1>
            <p className="mt-2 text-[#66736d]">Сводка по заявкам MVP.</p>
          </div>
          <Link href="/admin/applications" className="btn-primary">
            Открыть заявки
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <div key={card.label} className="panel p-5">
              <p className="text-sm text-[#66736d]">{card.label}</p>
              <p className="mt-3 text-4xl font-black text-[#0c3b2e]">{counts[index]}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
