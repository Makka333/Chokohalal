import Link from "next/link";

const links = [
  { href: "/calculator", label: "Калькулятор" },
  { href: "/application", label: "Заявка" },
  { href: "/terms", label: "Условия" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#d8ddd7] bg-[#fbfaf6]/92 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-black tracking-normal text-[#0c3b2e]">
          Choko Halal
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#31423b] md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#0c3b2e]">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/admin/login" className="text-sm font-semibold text-[#66736d] hover:text-[#0c3b2e]">
          Admin
        </Link>
      </div>
    </header>
  );
}
