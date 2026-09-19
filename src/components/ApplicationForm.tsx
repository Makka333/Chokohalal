"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalculationResult } from "@/components/CalculationResult";
import type { CalculationResult as CalculationResultType } from "@/types";

type StoredCalculation = {
  calculationId: string;
  offerId: string;
  result: CalculationResultType;
};

const storageKey = "chokohalal_calculation";

export function ApplicationForm() {
  const [stored, setStored] = useState<StoredCalculation | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    telegram: "",
    productName: "",
    comment: "",
    website: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      setStored(JSON.parse(raw) as StoredCalculation);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  function update(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!stored) {
        throw new Error("Сначала выполните расчёт рассрочки");
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          calculationId: stored.calculationId,
          offerId: stored.offerId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось отправить заявку");
      }

      setSuccess(true);
      localStorage.removeItem(storageKey);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось отправить заявку");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="panel mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-3xl font-black text-[#0c3b2e]">Заявка отправлена</h1>
        <p className="mt-4 text-[#66736d]">Администратор получит уведомление и свяжется с вами после проверки данных.</p>
        <Link href="/" className="btn-primary mt-6">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={submit} className="panel grid gap-5 p-5 md:p-7">
        <div>
          <h1 className="text-3xl font-black text-[#0c3b2e]">Заявка на рассрочку</h1>
          <p className="mt-3 text-[#66736d]">Заполните контакты. Расчёт предварительный и не является заключением договора.</p>
        </div>

        <input
          aria-hidden="true"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
        />

        <label className="grid gap-2">
          <span className="text-sm font-bold">Имя</span>
          <input className="field" value={form.name} onChange={(event) => update("name", event.target.value)} required />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold">Телефон</span>
          <input className="field" value={form.phone} onChange={(event) => update("phone", event.target.value)} required />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-bold">Email</span>
            <input className="field" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold">Telegram</span>
            <input className="field" value={form.telegram} onChange={(event) => update("telegram", event.target.value)} placeholder="@username" />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-bold">Название товара</span>
          <input className="field" value={form.productName} onChange={(event) => update("productName", event.target.value)} required />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold">Комментарий</span>
          <textarea className="field min-h-28" value={form.comment} onChange={(event) => update("comment", event.target.value)} />
        </label>

        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-[#a13d34]">{error}</p> : null}

        <button className="btn-primary" type="submit" disabled={loading || !stored}>
          {loading ? "Отправляем..." : "Отправить заявку"}
        </button>
      </form>

      <div className="grid gap-4 content-start">
        {stored ? (
          <CalculationResult result={stored.result} />
        ) : (
          <div className="panel p-6">
            <h2 className="text-xl font-black text-[#0c3b2e]">Нет выбранного расчёта</h2>
            <p className="mt-3 text-[#66736d]">Перед отправкой заявки нужно выполнить предварительный расчёт.</p>
            <Link href="/calculator" className="btn-primary mt-5">
              Перейти к калькулятору
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
