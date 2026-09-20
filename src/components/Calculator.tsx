"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalculationResult } from "@/components/CalculationResult";
import type { CalculationResult as CalculationResultType, PublicOffer } from "@/types";

type CalculationResponse = {
  calculationId: string;
  offerId: string;
  result: CalculationResultType;
};

const storageKey = "chokohalal_calculation";

export function Calculator() {
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [offerId, setOfferId] = useState("");
  const [productPrice, setProductPrice] = useState("100000.00");
  const [initialPayment, setInitialPayment] = useState("20000.00");
  const [term, setTerm] = useState(12);
  const [result, setResult] = useState<CalculationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/offers")
      .then(async (response) => {
        const data = (await response.json()) as { offers?: PublicOffer[]; error?: string };

        if (!response.ok || !Array.isArray(data.offers)) {
          throw new Error(data.error ?? "Не удалось загрузить предложения");
        }

        return { offers: data.offers };
      })
      .then((data: { offers: PublicOffer[] }) => {
        if (!mounted) return;
        setOffers(data.offers);
        const first = data.offers[0];
        if (first) {
          setOfferId(first.id);
          setTerm(first.availableTerms[0] ?? 3);
        }
      })
      .catch(() => setError("Не удалось загрузить предложения"));

    return () => {
      mounted = false;
    };
  }, []);

  const selectedOffer = useMemo(() => offers.find((offer) => offer.id === offerId), [offers, offerId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, productPrice, term, initialPayment }),
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

        <label className="grid gap-2">
          <span className="text-sm font-bold">Предложение</span>
          <select className="field" value={offerId} onChange={(event) => setOfferId(event.target.value)} required>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                {offer.name}
              </option>
            ))}
          </select>
        </label>

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
          {selectedOffer ? (
            <span className="text-xs text-[#66736d]">
              Доступно от {selectedOffer.minAmount} ₽ до {selectedOffer.maxAmount} ₽
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold">Срок</span>
          <select className="field" value={term} onChange={(event) => setTerm(Number(event.target.value))} required>
            {selectedOffer?.availableTerms.map((availableTerm) => (
              <option key={availableTerm} value={availableTerm}>
                {availableTerm} месяцев
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold">Первоначальный взнос, ₽</span>
          <input
            className="field"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={initialPayment}
            onChange={(event) => setInitialPayment(event.target.value)}
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
