export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-[#0c3b2e]">Политика конфиденциальности</h1>
      <div className="mt-6 grid gap-4 leading-8 text-[#31423b]">
        <p>Мы обрабатываем данные, которые пользователь указывает в заявке: имя, телефон, email или Telegram, название товара и комментарий.</p>
        <p>Данные используются для связи по заявке и внутренней обработки администратором. Секреты и технические ключи не передаются клиенту.</p>
        <p>Для production-развёртывания необходимо использовать HTTPS и защищённые переменные окружения.</p>
      </div>
    </main>
  );
}
