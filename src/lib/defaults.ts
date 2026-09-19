import type { PublicOffer } from "@/types";

export const DEFAULT_OFFER: PublicOffer = {
  id: "default",
  name: "Базовая рассрочка",
  description: "Простая модель рассрочки с заранее заданной наценкой по сроку.",
  minAmount: "10000.00",
  maxAmount: "1000000.00",
  status: "ACTIVE",
  availableTerms: [3, 6, 12],
  downPaymentRule: {
    minPercent: "0.00",
  },
  markupRule: [
    { term: 3, type: "PERCENT_OF_PRICE", value: "5.00" },
    { term: 6, type: "PERCENT_OF_PRICE", value: "10.00" },
    { term: 12, type: "PERCENT_OF_PRICE", value: "15.00" },
  ],
};
