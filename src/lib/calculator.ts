import Decimal from "decimal.js";
import type {
  CalculationResult,
  DownPaymentRule,
  PaymentScheduleItem,
  Tariff,
  TermMarkupRule,
} from "@/types";

export const MONEY_SCALE = 2;
export const ROUNDING_MODE = Decimal.ROUND_HALF_UP;
export const TARIFF_TERMS = Array.from({ length: 11 }, (_, index) => index + 2);
export const WITH_DOWN_PAYMENT_MARKUPS: Record<number, string> = {
  2: "9.00",
  3: "13.50",
  4: "18.00",
  5: "22.50",
  6: "27.00",
  7: "30.50",
  8: "34.00",
  9: "37.50",
  10: "41.00",
  11: "44.50",
  12: "48.00",
};
export const NO_DOWN_PAYMENT_MONTHLY_RATE = "3.60";

export class CalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculationError";
  }
}

export type CalculateInstallmentInput = {
  productPrice: string | Decimal;
  term: number;
  initialPayment: string | Decimal;
  minAmount: string | Decimal;
  maxAmount: string | Decimal;
  availableTerms: number[];
  downPaymentRule: DownPaymentRule;
  markupRule: TermMarkupRule[];
  firstPaymentDate?: Date;
};

export type GeneratePaymentScheduleInput = {
  amount: string | Decimal;
  periods: number;
  firstPaymentDate: Date;
};

export type TariffCalculationInput = {
  tariff: Tariff;
  productPrice: string | Decimal;
  initialPaymentPercent?: string | Decimal;
  term: number;
  firstPaymentDate?: Date;
};

export function toMoney(value: string | Decimal): Decimal {
  return new Decimal(value).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
}

export function calculateTariffInstallment(input: TariffCalculationInput): CalculationResult {
  const productPrice = toMoney(input.productPrice);
  const term = input.term;

  if (!productPrice.isFinite() || productPrice.lessThan("5000") || productPrice.greaterThan("1000000")) {
    throw new CalculationError("Стоимость товара должна быть от 5 000 до 1 000 000 ₽");
  }

  if (!TARIFF_TERMS.includes(term)) {
    throw new CalculationError("Срок должен быть от 2 до 12 месяцев");
  }

  const initialPaymentPercent =
    input.tariff === "NO_DOWN_PAYMENT"
      ? new Decimal(0)
      : new Decimal(input.initialPaymentPercent ?? "20");

  if (initialPaymentPercent.lessThan(0) || initialPaymentPercent.greaterThan(80)) {
    throw new CalculationError("Первоначальный взнос должен быть от 20% до 80%");
  }

  if (input.tariff === "WITH_DOWN_PAYMENT" && initialPaymentPercent.lessThan(20)) {
    throw new CalculationError("Первоначальный взнос должен быть от 20% до 80%");
  }

  const initialPayment = productPrice.mul(initialPaymentPercent).div(100).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
  const financedAmount = productPrice.minus(initialPayment).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
  const markupRate =
    input.tariff === "NO_DOWN_PAYMENT"
      ? new Decimal(NO_DOWN_PAYMENT_MONTHLY_RATE).mul(term)
      : new Decimal(WITH_DOWN_PAYMENT_MARKUPS[term]);
  const markup = (input.tariff === "NO_DOWN_PAYMENT" ? productPrice : financedAmount)
    .mul(input.tariff === "NO_DOWN_PAYMENT" ? markupRate : markupRate)
    .div(100)
    .toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
  const totalInstallment = financedAmount.plus(markup).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
  const totalClientCost = initialPayment.plus(totalInstallment).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
  const paymentSchedule = generatePaymentSchedule({
    amount: totalInstallment,
    periods: term,
    firstPaymentDate: input.firstPaymentDate ?? addMonths(new Date(), 1),
  });
  const firstPayment = new Decimal(paymentSchedule[0]?.amount ?? "0");
  const lastPayment = new Decimal(paymentSchedule.at(-1)?.amount ?? "0");

  return {
    productPrice: formatMoney(productPrice),
    term,
    initialPayment: formatMoney(initialPayment),
    markup: formatMoney(markup),
    totalPrice: formatMoney(totalClientCost),
    scheduledAmount: formatMoney(totalInstallment),
    periodicPayment: formatMoney(firstPayment),
    paymentCount: term,
    paymentSchedule,
    lastPaymentDiffers: !firstPayment.equals(lastPayment),
    tariff: input.tariff,
    initialPaymentPercent: formatMoney(initialPaymentPercent),
    financedAmount: formatMoney(financedAmount),
    overpayment: formatMoney(markup),
    totalClientCost: formatMoney(totalClientCost),
    markupRate: formatMoney(markupRate),
  };
}

export function formatMoney(value: Decimal): string {
  return value.toFixed(MONEY_SCALE);
}

export function calculateInstallment(input: CalculateInstallmentInput): CalculationResult {
  const productPrice = toMoney(input.productPrice);
  const initialPayment = toMoney(input.initialPayment);
  const minAmount = toMoney(input.minAmount);
  const maxAmount = toMoney(input.maxAmount);

  if (!productPrice.isFinite() || productPrice.isNegative()) {
    throw new CalculationError("Стоимость товара должна быть положительной");
  }

  if (productPrice.lessThan(minAmount)) {
    throw new CalculationError("Стоимость товара ниже минимальной суммы");
  }

  if (productPrice.greaterThan(maxAmount)) {
    throw new CalculationError("Стоимость товара выше максимальной суммы");
  }

  if (!input.availableTerms.includes(input.term)) {
    throw new CalculationError("Выбранный срок недоступен");
  }

  if (!initialPayment.isFinite() || initialPayment.isNegative()) {
    throw new CalculationError("Первоначальный взнос не может быть отрицательным");
  }

  if (initialPayment.greaterThan(productPrice)) {
    throw new CalculationError("Первоначальный взнос не может превышать стоимость товара");
  }

  const minDownPayment = productPrice
    .mul(new Decimal(input.downPaymentRule.minPercent))
    .div(100)
    .toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);

  if (initialPayment.lessThan(minDownPayment)) {
    throw new CalculationError("Первоначальный взнос ниже минимального значения");
  }

  const markup = resolveMarkup(productPrice, input.term, input.markupRule);
  const totalPrice = productPrice.plus(markup).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
  const scheduledAmount = totalPrice.minus(initialPayment).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
  const firstPaymentDate = input.firstPaymentDate ?? addMonths(new Date(), 1);
  const paymentSchedule = generatePaymentSchedule({
    amount: scheduledAmount,
    periods: input.term,
    firstPaymentDate,
  });
  const firstPayment = new Decimal(paymentSchedule[0]?.amount ?? "0.00");
  const lastPayment = new Decimal(paymentSchedule[paymentSchedule.length - 1]?.amount ?? "0.00");

  return {
    productPrice: formatMoney(productPrice),
    term: input.term,
    initialPayment: formatMoney(initialPayment),
    markup: formatMoney(markup),
    totalPrice: formatMoney(totalPrice),
    scheduledAmount: formatMoney(scheduledAmount),
    periodicPayment: formatMoney(firstPayment),
    paymentCount: input.term,
    paymentSchedule,
    lastPaymentDiffers: !firstPayment.equals(lastPayment),
  };
}

export function resolveMarkup(
  productPrice: Decimal,
  term: number,
  rules: TermMarkupRule[],
): Decimal {
  const rule = rules.find((item) => item.term === term);

  if (!rule) {
    throw new CalculationError("Для выбранного срока не настроена наценка");
  }

  if (rule.type === "FIXED_AMOUNT") {
    return toMoney(rule.value);
  }

  return productPrice
    .mul(new Decimal(rule.value))
    .div(100)
    .toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
}

export function generatePaymentSchedule(input: GeneratePaymentScheduleInput): PaymentScheduleItem[] {
  const total = toMoney(input.amount);

  if (!Number.isInteger(input.periods) || input.periods <= 0) {
    throw new CalculationError("Количество периодов должно быть положительным целым числом");
  }

  if (!total.isFinite() || total.isNegative()) {
    throw new CalculationError("Сумма графика не может быть отрицательной");
  }

  const regularPayment = total.div(input.periods).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
  let remaining = total;
  const schedule: PaymentScheduleItem[] = [];

  for (let index = 1; index <= input.periods; index += 1) {
    const isLast = index === input.periods;
    const amount = isLast ? remaining : Decimal.min(regularPayment, remaining);
    remaining = remaining.minus(amount).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);

    schedule.push({
      number: index,
      date: formatDate(addMonths(input.firstPaymentDate, index - 1)),
      amount: formatMoney(amount),
      remaining: formatMoney(remaining),
    });
  }

  const sum = schedule.reduce((acc, item) => acc.plus(item.amount), new Decimal(0));
  if (!sum.equals(total)) {
    throw new CalculationError("Сумма платежей не совпадает с суммой графика");
  }

  return schedule;
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = next.getUTCDate();
  next.setUTCMonth(next.getUTCMonth() + months);

  if (next.getUTCDate() !== day) {
    next.setUTCDate(0);
  }

  return next;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
