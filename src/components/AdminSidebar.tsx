import Link from "next/link";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/applications", label: "Заявки" },
  { href: "/admin/settings", label: "Настройки" },
];

export function AdminSidebar() {
  return (
    <aside className="border-b border-[#d8ddd7] bg-white md:min-h-[calc(100vh-73px)] md:w-64 md:border-b-0 md:border-r">
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-4 md:grid md:px-5">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-lg px-4 py-3 text-sm font-bold text-[#31423b] hover:bg-[#e7efe8]">
            {link.label}
          </Link>
        ))}
        <form action="/api/admin/logout" method="post">
          <button className="rounded-lg px-4 py-3 text-sm font-bold text-[#66736d] hover:bg-[#f3f0e8]" type="submit">
            Выйти
          </button>
        </form>
      </nav>
    </aside>
  );
}
