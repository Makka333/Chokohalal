import Decimal from "decimal.js";
import type {
  CalculationResult,
  DownPaymentRule,
  PaymentScheduleItem,
  TermMarkupRule,
} from "@/types";

export const MONEY_SCALE = 2;
export const ROUNDING_MODE = Decimal.ROUND_HALF_UP;

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

export function toMoney(value: string | Decimal): Decimal {
  return new Decimal(value).toDecimalPlaces(MONEY_SCALE, ROUNDING_MODE);
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
