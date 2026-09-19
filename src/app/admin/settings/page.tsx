import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { OfferSettingsForm } from "@/components/OfferSettingsForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveOffers } from "@/lib/offers";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const [offer] = await getActiveOffers();
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { admin: true },
  });

  return (
    <main className="md:flex">
      <AdminSidebar />
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8">
        <div>
          <h1 className="text-3xl font-black text-[#0c3b2e]">Настройки предложения</h1>
          <p className="mt-2 text-[#66736d]">Изменение сроков, наценки, первоначального взноса и активности пишется в AuditLog.</p>
        </div>
        {offer ? <OfferSettingsForm offer={offer} /> : null}
        <section>
          <h2 className="text-2xl font-black text-[#0c3b2e]">Журнал изменений</h2>
          <div className="mt-4 grid gap-3">
            {logs.map((log) => (
              <article key={log.id} className="rounded-lg border border-[#d8ddd7] bg-white p-4 text-sm">
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <p className="font-bold">{log.action}</p>
                  <p className="text-[#66736d]">{log.createdAt.toLocaleString("ru-RU")}</p>
                </div>
                <p className="mt-2 text-[#66736d]">Администратор: {log.admin?.login ?? "system"}</p>
                <pre className="mt-3 overflow-auto rounded-lg bg-[#f7f4ed] p-3 text-xs">{JSON.stringify(log.object, null, 2)}</pre>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
