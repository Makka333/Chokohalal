import Link from "next/link";

const steps = [
  "Вы выбираете товар и вводите стоимость.",
  "Сервис показывает утверждённую наценку для выбранного срока.",
  "После заявки администратор проверяет данные и связывается с вами.",
];

const benefits = ["Прозрачная итоговая цена", "Фиксированный график", "Без онлайн-оплаты на этапе MVP"];

export default function HomePage() {
  return (
    <main>
      <section className="bg-[#0c3b2e] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#efe3cc]">Исламская рассрочка</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Понятный расчёт рассрочки до подачи заявки
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#dbe8df]">
              Вы видите цену товара, фиксированную наценку, итоговую цену, первоначальный взнос и график платежей до отправки заявки.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/calculator" className="btn-primary bg-white text-[#0c3b2e] hover:bg-[#efe3cc]">
                Рассчитать рассрочку
              </Link>
              <Link href="/application" className="btn-secondary border-white text-white hover:bg-white/10">
                Оставить заявку
              </Link>
            </div>
            <p className="mt-8 rounded-lg border border-white/20 bg-white/10 p-4 text-sm text-[#f7efd7]">
              Расчёт является предварительным и не является заключением договора.
            </p>
          </div>
          <div className="grid gap-4 rounded-lg border border-white/15 bg-[#143f34] p-5 shadow-2xl shadow-black/20">
            <div className="rounded-lg bg-[#fbfaf6] p-5 text-[#10251f]">
              <p className="text-sm text-[#66736d]">Пример расчёта</p>
              <p className="mt-3 text-3xl font-black">100 000 ₽</p>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between"><span>Наценка</span><b>15 000 ₽</b></div>
                <div className="flex justify-between"><span>Итоговая цена</span><b>115 000 ₽</b></div>
                <div className="flex justify-between"><span>Взнос</span><b>20 000 ₽</b></div>
                <div className="flex justify-between border-t border-[#d8ddd7] pt-3"><span>12 платежей</span><b>7 916.67 ₽</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-black text-[#0c3b2e]">Как это работает</h2>
            <p className="mt-3 text-[#66736d]">MVP реализует только заранее заданную финансовую модель без штрафов, плавающих ставок и онлайн-оплаты.</p>
          </div>
          {steps.map((step, index) => (
            <div key={step} className="panel p-5">
              <span className="text-sm font-black text-[#0c3b2e]">0{index + 1}</span>
              <p className="mt-3 font-semibold leading-7">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-black text-[#0c3b2e]">Преимущества</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-lg border border-[#d8ddd7] p-5 font-semibold">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
