import { z } from "zod";

const decimalString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Введите сумму с точностью до копеек");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s().-]{7,20}$/, "Введите корректный телефон");

export const calculationRequestSchema = z.object({
  offerId: z.string().min(1).optional(),
  productPrice: decimalString,
  term: z.coerce.number().int().positive(),
  initialPayment: decimalString.optional(),
  tariff: z.enum(["WITH_DOWN_PAYMENT", "NO_DOWN_PAYMENT"]).optional(),
  initialPaymentPercent: decimalString.optional(),
});

export const applicationRequestSchema = z
  .object({
    calculationId: z.string().min(1).optional(),
    offerId: z.string().min(1).optional(),
    calculation: calculationRequestSchema.optional(),
    name: z.string().trim().min(2, "Введите имя").max(100),
    phone: phoneSchema,
    email: z.string().trim().email("Введите корректный email").optional().or(z.literal("")),
    telegram: z.string().trim().max(64).optional().or(z.literal("")),
    productName: z.string().trim().min(2, "Введите название товара").max(160),
    comment: z.string().trim().max(1000).optional().or(z.literal("")),
    website: z.string().max(0).optional(),
  })
  .refine((value) => value.email || value.telegram, {
    message: "Укажите email или Telegram",
    path: ["email"],
  })
  .refine((value) => value.calculationId || value.calculation, {
    message: "Передайте параметры расчёта",
    path: ["calculation"],
  })
  .refine((value) => !value.calculationId || value.offerId, {
    message: "Передайте предложение для расчёта",
    path: ["offerId"],
  });

export const loginSchema = z.object({
  login: z.string().trim().min(2),
  password: z.string().min(8),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["NEW", "UNDER_REVIEW", "APPROVED", "REJECTED", "COMPLETED"]),
});

export const offerUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().min(2).max(1000).optional(),
  minAmount: decimalString.optional(),
  maxAmount: decimalString.optional(),
  availableTerms: z.array(z.coerce.number().int().positive()).min(1).optional(),
  downPaymentRule: z
    .object({
      minPercent: decimalString,
    })
    .optional(),
  markupRule: z
    .array(
      z.object({
        term: z.coerce.number().int().positive(),
        type: z.enum(["FIXED_AMOUNT", "PERCENT_OF_PRICE"]),
        value: decimalString,
      }),
    )
    .min(1)
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
