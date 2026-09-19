import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApplicationStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const applications = await prisma.application.findMany({
    include: { calculation: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="md:flex">
      <AdminSidebar />
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-black text-[#0c3b2e]">Заявки</h1>
        <div className="mt-6 overflow-x-auto rounded-lg border border-[#d8ddd7] bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[#f3f0e8]">
              <tr>
                <th className="px-4 py-3">№</th>
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3">Телефон</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Срок</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Дата</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application, index) => (
                <tr key={application.id} className="border-t border-[#edf0ec] hover:bg-[#fbfaf6]">
                  <td className="px-4 py-3">
                    <Link className="font-bold text-[#0c3b2e]" href={`/admin/applications/${application.id}`}>
                      {index + 1}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{application.name}</td>
                  <td className="px-4 py-3">{application.phone}</td>
                  <td className="px-4 py-3">{application.calculation.totalPrice.toString()} ₽</td>
                  <td className="px-4 py-3">{application.calculation.term} мес.</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={application.status as ApplicationStatus} />
                  </td>
                  <td className="px-4 py-3">{application.createdAt.toLocaleDateString("ru-RU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
