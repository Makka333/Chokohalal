import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#d8ddd7] bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-[#66736d] md:grid-cols-3">
        <div>
          <p className="font-bold text-[#0c3b2e]">Choko Halal</p>
          <p className="mt-2">Предварительный сервис заявок на рассрочку для пилотного запуска.</p>
        </div>
        <div className="flex gap-4 md:justify-center">
          <Link href="/terms">Условия</Link>
          <Link href="/privacy">Конфиденциальность</Link>
          <Link href="/contacts">Контакты</Link>
        </div>
        <p className="md:text-right">Расчёт является предварительным и не является заключением договора.</p>
      </div>
    </footer>
  );
}
