"use client";

import Link from "next/link";
import { useState } from "react";
import { CalculationResult } from "@/components/CalculationResult";
import type { CalculationResult as CalculationResultType, Tariff } from "@/types";

type CalculationResponse = {
  calculationId: string;
  offerId: string;
  result: CalculationResultType;
};

const storageKey = "chokohalal_calculation";

export function Calculator() {
  const [tariff, setTariff] = useState<Tariff>("WITH_DOWN_PAYMENT");
  const [productPrice, setProductPrice] = useState("100000");
  const [initialPaymentPercent, setInitialPaymentPercent] = useState("20");
  const [term, setTerm] = useState(12);
  const [result, setResult] = useState<CalculationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productPrice,
          term,
          tariff,
          initialPaymentPercent: tariff === "WITH_DOWN_PAYMENT" ? initialPaymentPercent : "0",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось выполнить расчёт");
      }

      setResult(data);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось выполнить расчёт");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={submit} className="panel grid content-start gap-5 p-5 md:p-7">
        <div>
          <h1 className="text-3xl font-black text-[#0c3b2e]">Калькулятор рассрочки</h1>
          <p className="mt-3 text-[#66736d]">
            Расчёт предварительный. Он не является заключением договора и не заменяет проверку заявки.
          </p>
        </div>

        <div className="tariff-switch" role="tablist" aria-label="Тариф рассрочки">
          <button type="button" className={tariff === "WITH_DOWN_PAYMENT" ? "is-active" : ""} onClick={() => setTariff("WITH_DOWN_PAYMENT")}>
            С первоначальным взносом
          </button>
          <button type="button" className={tariff === "NO_DOWN_PAYMENT" ? "is-active" : ""} onClick={() => setTariff("NO_DOWN_PAYMENT")}>
            Без первоначального взноса
          </button>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-bold">Стоимость товара, ₽</span>
          <input
            className="field"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={productPrice}
            onChange={(event) => setProductPrice(event.target.value)}
            required
          />
          <span className="text-xs text-[#66736d]">Доступно от 5 000 ₽ до 1 000 000 ₽</span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold">Срок</span>
          <select className="field" value={term} onChange={(event) => setTerm(Number(event.target.value))} required>
            {Array.from({ length: 11 }, (_, index) => index + 2).map((availableTerm) => (
              <option key={availableTerm} value={availableTerm}>{availableTerm} месяцев</option>
            ))}
          </select>
        </label>

        <label className={`grid gap-2 ${tariff === "NO_DOWN_PAYMENT" ? "opacity-50" : ""}`}>
          <span className="text-sm font-bold">Первоначальный взнос, %</span>
          <input
            className="field"
            inputMode="decimal"
            min="20"
            max="80"
            step="1"
            value={tariff === "NO_DOWN_PAYMENT" ? "0" : initialPaymentPercent}
            disabled={tariff === "NO_DOWN_PAYMENT"}
            onChange={(event) => setInitialPaymentPercent(event.target.value)}
            required
          />
        </label>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-[#a13d34]">{error}</p> : null}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Считаем..." : "Рассчитать"}
        </button>
      </form>

      <div className="grid gap-5">
        {result ? (
          <>
            <CalculationResult result={result.result} />
            <Link href="/application" className="btn-primary w-full sm:w-fit">
              Оставить заявку
            </Link>
          </>
        ) : (
          <div className="panel flex min-h-[360px] items-center justify-center p-8 text-center text-[#66736d]">
            Введите стоимость, выберите срок и первоначальный взнос. Здесь появится итоговая цена и график платежей.
          </div>
        )}
      </div>
    </div>
  );
}
