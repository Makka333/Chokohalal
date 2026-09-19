import type { PaymentScheduleItem } from "@/types";

export function PaymentSchedule({ items }: { items: PaymentScheduleItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#d8ddd7] bg-white">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="bg-[#f3f0e8] text-[#31423b]">
          <tr>
            <th className="px-4 py-3">№</th>
            <th className="px-4 py-3">Дата</th>
            <th className="px-4 py-3">Платёж</th>
            <th className="px-4 py-3">Остаток</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.number} className="border-t border-[#edf0ec]">
              <td className="px-4 py-3 font-semibold">{item.number}</td>
              <td className="px-4 py-3">{item.date}</td>
              <td className="px-4 py-3">{item.amount} ₽</td>
              <td className="px-4 py-3">{item.remaining} ₽</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
