export default function ContactsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-[#0c3b2e]">Контакты</h1>
      <div className="mt-6 grid gap-4 leading-8 text-[#31423b]">
        <p>По вопросам рассрочки и заявки свяжитесь с нами удобным способом:</p>
        <p>
          Email:{" "}
          <a className="font-bold text-[#0c3b2e] underline decoration-[#d5ad63] underline-offset-4" href="mailto:makka1207dz@icloud.com">
            makka1207dz@icloud.com
          </a>
        </p>
        <p>
          Telegram:{" "}
          <a className="font-bold text-[#0c3b2e] underline decoration-[#d5ad63] underline-offset-4" href="https://t.me/mkkdzv" target="_blank" rel="noreferrer">
            @mkkdzv
          </a>
        </p>
        <p>В форме заявки можно указать email, Telegram или оба способа связи. Уведомления администратора подключаются через защищённые переменные окружения.</p>
      </div>
    </main>
  );
}
