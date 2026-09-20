import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#d8ddd7] bg-[#f7f4ee]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-[#66736d] md:grid-cols-3">
        <div>
          <p className="text-lg font-black tracking-[-0.06em] text-[#0c3b2e]">Choko Halal</p>
          <p className="mt-2 max-w-xs leading-6">Предварительный сервис заявок на рассрочку для пилотного запуска.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:justify-center">
          <Link href="/terms" className="transition-colors hover:text-[#0c3b2e]">Условия</Link>
          <Link href="/privacy" className="transition-colors hover:text-[#0c3b2e]">Конфиденциальность</Link>
          <Link href="/contacts" className="transition-colors hover:text-[#0c3b2e]">Контакты</Link>
        </div>
        <p className="leading-6 md:text-right">Расчёт является предварительным и не является заключением договора.</p>
      </div>
    </footer>
  );
}
