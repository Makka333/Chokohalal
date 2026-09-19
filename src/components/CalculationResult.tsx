import type { CalculationResult as CalculationResultType } from "@/types";
import { PaymentSchedule } from "@/components/PaymentSchedule";

const labels: Array<[keyof CalculationResultType, string]> = [
  ["productPrice", "Цена товара"],
  ["markup", "Наценка"],
  ["totalPrice", "Итоговая цена"],
  ["initialPayment", "Первоначальный взнос"],
  ["scheduledAmount", "Сумма к оплате по графику"],
  ["periodicPayment", "Периодический платёж"],
];

export function CalculationResult({ result }: { result: CalculationResultType }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {labels.map(([key, label]) => (
          <div key={key} className="rounded-lg border border-[#d8ddd7] bg-white p-4">
            <p className="text-sm text-[#66736d]">{label}</p>
            <p className="mt-2 text-2xl font-black text-[#0c3b2e]">{String(result[key])} ₽</p>
          </div>
        ))}
        <div className="rounded-lg border border-[#d8ddd7] bg-white p-4">
          <p className="text-sm text-[#66736d]">Количество платежей</p>
          <p className="mt-2 text-2xl font-black text-[#0c3b2e]">{result.paymentCount}</p>
        </div>
        <div className="rounded-lg border border-[#d8ddd7] bg-white p-4">
          <p className="text-sm text-[#66736d]">Срок</p>
          <p className="mt-2 text-2xl font-black text-[#0c3b2e]">{result.term} мес.</p>
        </div>
      </div>
      {result.lastPaymentDiffers ? (
        <p className="disclaimer rounded-lg p-4 text-sm">
          Последний платёж отличается из-за округления, чтобы сумма всех платежей точно совпала с суммой по графику.
        </p>
      ) : null}
      <PaymentSchedule items={result.paymentSchedule} />
    </section>
  );
}
