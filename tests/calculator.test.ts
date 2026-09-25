import { describe, expect, it } from "vitest";
import { calculateInstallment, calculateTariffInstallment, generatePaymentSchedule } from "../src/lib/calculator";
import { applicationRequestSchema } from "../src/lib/validation";
import type { DownPaymentRule, TermMarkupRule } from "../src/types";

const availableTerms = [3, 6, 12];
const downPaymentRule: DownPaymentRule = { minPercent: "10.00" };
const markupRule: TermMarkupRule[] = [
  { term: 3, type: "PERCENT_OF_PRICE", value: "5.00" },
  { term: 6, type: "PERCENT_OF_PRICE", value: "10.00" },
  { term: 12, type: "PERCENT_OF_PRICE", value: "15.00" },
];

function calc(overrides: Partial<Parameters<typeof calculateInstallment>[0]> = {}) {
  return calculateInstallment({
    productPrice: "100000.00",
    term: 12,
    initialPayment: "20000.00",
    minAmount: "10000.00",
    maxAmount: "1000000.00",
    availableTerms,
    downPaymentRule,
    markupRule,
    firstPaymentDate: new Date("2026-10-19T00:00:00.000Z"),
    ...overrides,
  });
}

describe("calculator", () => {
  it("calculates the down payment tariff from the specification", () => {
    const result = calculateTariffInstallment({
      tariff: "WITH_DOWN_PAYMENT",
      productPrice: "100000",
      initialPaymentPercent: "20",
      term: 12,
      firstPaymentDate: new Date("2026-10-19T00:00:00.000Z"),
    });

    expect(result.initialPayment).toBe("20000.00");
    expect(result.financedAmount).toBe("80000.00");
    expect(result.markup).toBe("38400.00");
    expect(result.periodicPayment).toBe("9866.67");
    expect(result.totalClientCost).toBe("138400.00");
  });

  it("calculates the no down payment tariff from the specification", () => {
    const result = calculateTariffInstallment({
      tariff: "NO_DOWN_PAYMENT",
      productPrice: "100000",
      term: 12,
      firstPaymentDate: new Date("2026-10-19T00:00:00.000Z"),
    });

    expect(result.initialPayment).toBe("0.00");
    expect(result.markup).toBe("43200.00");
    expect(result.periodicPayment).toBe("11933.33");
    expect(result.totalClientCost).toBe("143200.00");
  });

  it("accepts minimal amount", () => {
    const result = calc({ productPrice: "10000.00", initialPayment: "1000.00" });
    expect(result.productPrice).toBe("10000.00");
  });

  it("accepts maximum amount", () => {
    const result = calc({ productPrice: "1000000.00", initialPayment: "100000.00" });
    expect(result.totalPrice).toBe("1150000.00");
  });

  it("rejects amount below minimum", () => {
    expect(() => calc({ productPrice: "9999.99", initialPayment: "1000.00" })).toThrow("ниже минимальной");
  });

  it("rejects amount above maximum", () => {
    expect(() => calc({ productPrice: "1000000.01", initialPayment: "100000.00" })).toThrow("выше максимальной");
  });

  it("calculates 3 month term", () => {
    const result = calc({ term: 3 });
    expect(result.markup).toBe("5000.00");
    expect(result.paymentCount).toBe(3);
  });

  it("calculates 6 month term", () => {
    const result = calc({ term: 6 });
    expect(result.markup).toBe("10000.00");
    expect(result.paymentCount).toBe(6);
  });

  it("calculates 12 month control example", () => {
    const result = calc();
    expect(result.markup).toBe("15000.00");
    expect(result.totalPrice).toBe("115000.00");
    expect(result.scheduledAmount).toBe("95000.00");
    expect(result.periodicPayment).toBe("7916.67");
  });

  it("rejects unavailable term", () => {
    expect(() => calc({ term: 9 })).toThrow("недоступен");
  });

  it("rejects zero down payment when minimum is required", () => {
    expect(() => calc({ initialPayment: "0.00" })).toThrow("ниже минимального");
  });

  it("accepts minimum down payment", () => {
    const result = calc({ initialPayment: "10000.00" });
    expect(result.initialPayment).toBe("10000.00");
  });

  it("accepts maximum down payment equal to price", () => {
    const result = calc({ initialPayment: "100000.00" });
    expect(result.scheduledAmount).toBe("15000.00");
  });

  it("rejects down payment above price", () => {
    expect(() => calc({ initialPayment: "100000.01" })).toThrow("не может превышать");
  });

  it("makes rounding visible in the last payment", () => {
    const schedule = generatePaymentSchedule({
      amount: "100.00",
      periods: 3,
      firstPaymentDate: new Date("2026-10-19T00:00:00.000Z"),
    });
    expect(schedule.map((item) => item.amount)).toEqual(["33.33", "33.33", "33.34"]);
  });

  it("keeps payment sum equal to scheduled amount", () => {
    const result = calc();
    const sum = result.paymentSchedule.reduce((total, item) => total + Number(item.amount), 0);
    expect(sum.toFixed(2)).toBe(result.scheduledAmount);
  });

  it("handles large amount deterministically", () => {
    const first = calc({ productPrice: "999999.99", initialPayment: "100000.00" });
    const second = calc({ productPrice: "999999.99", initialPayment: "100000.00" });
    expect(first).toEqual(second);
  });

  it("rejects invalid periods in schedule generation", () => {
    expect(() =>
      generatePaymentSchedule({
        amount: "100.00",
        periods: 0,
        firstPaymentDate: new Date("2026-10-19T00:00:00.000Z"),
      }),
    ).toThrow("положительным");
  });

  it("validates application creation payload", () => {
    const parsed = applicationRequestSchema.parse({
      calculationId: "calc_1",
      offerId: "offer_1",
      name: "Али",
      phone: "+7 999 111-22-33",
      email: "ali@example.com",
      telegram: "",
      productName: "Ноутбук",
      comment: "Связаться после 18:00",
    });

    expect(parsed.productName).toBe("Ноутбук");
  });
});
