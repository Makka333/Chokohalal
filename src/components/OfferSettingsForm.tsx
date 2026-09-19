"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicOffer, TermMarkupRule } from "@/types";

function markupsToState(rules: TermMarkupRule[]) {
  return rules.map((rule) => ({ ...rule, value: rule.value.toString() }));
}

export function OfferSettingsForm({ offer }: { offer: PublicOffer }) {
  const router = useRouter();
  const [minAmount, setMinAmount] = useState(offer.minAmount);
  const [maxAmount, setMaxAmount] = useState(offer.maxAmount);
  const [terms, setTerms] = useState(offer.availableTerms.join(", "));
  const [downPayment, setDownPayment] = useState(offer.downPaymentRule.minPercent);
  const [status, setStatus] = useState(offer.status);
  const [markups, setMarkups] = useState(markupsToState(offer.markupRule));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateMarkup(index: number, value: string) {
    setMarkups((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, value } : item)));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const availableTerms = terms
        .split(",")
        .map((item) => Number(item.trim()))
        .filter(Boolean);
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minAmount,
          maxAmount,
          availableTerms,
          downPaymentRule: { minPercent: downPayment },
          markupRule: markups.map((item) => ({ ...item, term: Number(item.term) })),
          status,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось сохранить настройки");
      }

      setMessage("Настройки сохранены");
      router.refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Не удалось сохранить настройки");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel grid gap-5 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-bold">Минимальная сумма</span>
          <input className="field" value={minAmount} onChange={(event) => setMinAmount(event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold">Максимальная сумма</span>
          <input className="field" value={maxAmount} onChange={(event) => setMaxAmount(event.target.value)} />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-bold">Доступные сроки, месяцев</span>
        <input className="field" value={terms} onChange={(event) => setTerms(event.target.value)} />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-bold">Минимальный первоначальный взнос, %</span>
        <input className="field" value={downPayment} onChange={(event) => setDownPayment(event.target.value)} />
      </label>
      <div className="grid gap-3">
        <p className="text-sm font-bold">Наценка по срокам</p>
        {markups.map((markup, index) => (
          <label key={markup.term} className="grid gap-2 rounded-lg border border-[#d8ddd7] bg-white p-3">
            <span className="text-sm text-[#66736d]">{markup.term} мес. ({markup.type === "PERCENT_OF_PRICE" ? "%" : "₽"})</span>
            <input className="field" value={markup.value} onChange={(event) => updateMarkup(index, event.target.value)} />
          </label>
        ))}
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-bold">Активность</span>
        <select className="field" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="ACTIVE">Включено</option>
          <option value="INACTIVE">Отключено</option>
        </select>
      </label>
      <button className="btn-primary" type="submit" disabled={loading}>
        Сохранить настройки
      </button>
      {message ? <p className="text-sm text-[#66736d]">{message}</p> : null}
    </form>
  );
}
