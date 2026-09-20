import Link from "next/link";

const links = [
  { href: "/calculator", label: "Калькулятор" },
  { href: "/application", label: "Заявка" },
  { href: "/terms", label: "Условия" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="flex items-center gap-3 text-[#0c3b2e]">
          <div className="brand-mark">
            <span>CH</span>
          </div>
          <div>
            <div className="text-lg font-black tracking-[-0.06em]">Choko Halal</div>
            <div className="brand-caption">Рассрочка нового уровня</div>
          </div>
        </Link>

        <nav className="site-nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/calculator" className="header-cta">
          <span>Рассчитать</span>
          <span className="header-cta__arrow">↗</span>
        </Link>
      </div>
    </header>
  );
}
