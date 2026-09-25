import Link from "next/link";

const steps = [
  "Выбираете товар и указываете стоимость.",
  "Сервис показывает фиксированную наценку и итоговый график платежей.",
  "Отправляете заявку — администратор проверяет и связывается с вами.",
];

const benefits = [
  { title: "Прозрачная цена", text: "Сумма, наценка и график известны заранее без скрытых условий." },
  { title: "Фиксированный график", text: "Платёжные даты и размер платежей рассчитываются до подачи заявки." },
  { title: "Надёжный MVP", text: "Без онлайн-оплаты, без плавающих ставок и без лишних рисков." },
];

const stats = [
  { value: "3–18", label: "месяцев" },
  { value: "5", label: "доступных сроков" },
  { value: "7 млн ₽", label: "максимальная сумма" },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-orb hero-orb--one" />
        <div className="hero-orb hero-orb--two" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> Исламская рассрочка</p>
            <h1>Покупайте сегодня — <span>платите частями</span></h1>
            <p className="hero-text">
              Доступная и прозрачная рассрочка с понятными условиями, фиксированной наценкой и графиком платежей
              до подачи заявки.
            </p>
            <div className="cta-row">
              <Link href="/calculator" className="btn-primary btn-primary--light">
                Рассчитать рассрочку
              </Link>
              <Link href="/application" className="btn-secondary btn-secondary--light">
                Оставить заявку
              </Link>
            </div>
            <div className="stats-grid">
              {stats.map((stat) => (
                <div key={stat.label} className="mini-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
            <p className="disclaimer-banner">
              <span className="disclaimer-icon">✦</span>
              Расчёт предварительный и не является заключением договора.
            </p>
          </div>

          <div className="calculator-card">
            <div className="calculator-card__header">
              <span><span className="calculator-card__dot" /> Калькулятор рассрочки</span>
              <span className="badge">LIVE</span>
            </div>

            <div className="calculator-form">
              <div className="input-row">
                <label>Цена товара</label>
                <div className="amount-box">100 000 ₽</div>
              </div>

              <div className="input-row compact">
                <label>Срок</label>
                <div className="selector-box">12 месяцев</div>
              </div>

              <div className="input-row compact">
                <label>Первоначальный взнос</label>
                <div className="selector-box">20 000 ₽</div>
              </div>

              <div className="calculator-summary">
                <div>
                  <span>Наценка</span>
                  <strong>15 000 ₽</strong>
                </div>
                <div>
                  <span>Итоговая цена</span>
                  <strong>115 000 ₽</strong>
                </div>
                <div>
                  <span>Платёж</span>
                  <strong>7 916.67 ₽</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-headline">
          <p className="eyebrow eyebrow--green"><span className="eyebrow-dot eyebrow-dot--green" /> Как это работает</p>
          <h2>Четыре шага к важной покупке</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article key={step} className="feature-card">
              <span className="feature-number">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block section-block--light">
        <div className="section-headline">
          <p className="eyebrow eyebrow--green">Преимущества</p>
          <h2>Почему клиенты выбирают понятный формат рассрочки</h2>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="benefit-card">
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tariffs-section">
        <div className="section-headline">
          <p className="eyebrow eyebrow--green"><span className="eyebrow-dot eyebrow-dot--green" /> Тарифы</p>
          <h2>Два удобных варианта рассрочки</h2>
        </div>
        <div className="tariffs-grid">
          <article className="tariff-card tariff-card--dark">
            <span className="tariff-kicker">01 / Выгодный формат</span>
            <h3>С первоначальным взносом</h3>
            <p>Меньшая наценка и комфортный ежемесячный платёж.</p>
            <ul>
              <li>Взнос от 20% до 80%</li>
              <li>Срок от 2 до 12 месяцев</li>
              <li>Наценка от 9% до 48%</li>
              <li>Один поручитель, возраст от 21 года</li>
            </ul>
            <Link href="/calculator" className="tariff-link">Рассчитать тариф <span>↗</span></Link>
          </article>
          <article className="tariff-card tariff-card--cream">
            <span className="tariff-kicker">02 / Максимальная доступность</span>
            <h3>Без первоначального взноса</h3>
            <p>Начните пользоваться покупкой сейчас и платите равными частями.</p>
            <ul>
              <li>Первоначальный взнос 0 ₽</li>
              <li>Срок от 2 до 12 месяцев</li>
              <li>Наценка 3,6% за каждый месяц</li>
              <li>Один поручитель, возраст от 21 года</li>
            </ul>
            <Link href="/calculator" className="tariff-link">Рассчитать тариф <span>↗</span></Link>
          </article>
        </div>
      </section>
    </main>
  );
}
