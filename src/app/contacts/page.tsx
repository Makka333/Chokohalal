export default function ContactsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-[#0c3b2e]">Контакты</h1>
      <div className="mt-6 grid gap-4 leading-8 text-[#31423b]">
        <p>Для пилотного запуска укажите рабочие контакты компании и email администратора через переменную окружения ADMIN_EMAIL.</p>
        <p>Email: будет настроен владельцем сервиса.</p>
        <p>Telegram-уведомления включаются только при наличии TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.</p>
      </div>
    </main>
  );
}
