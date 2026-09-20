import type { PublicOffer } from "@/types";

export const DEFAULT_OFFER: PublicOffer = {
  id: "default",
  name: "Базовая рассрочка",
  description: "Мурабаха с фиксированной наценкой по сроку. Без автоматических штрафов и процентов за просрочку.",
  minAmount: "10000.00",
  maxAmount: "7000000.00",
  status: "ACTIVE",
  availableTerms: [3, 6, 9, 12, 18],
  downPaymentRule: {
    minPercent: "0.00",
  },
  markupRule: [
    { term: 3, type: "PERCENT_OF_PRICE", value: "5.00" },
    { term: 6, type: "PERCENT_OF_PRICE", value: "10.00" },
    { term: 9, type: "PERCENT_OF_PRICE", value: "12.50" },
    { term: 12, type: "PERCENT_OF_PRICE", value: "15.00" },
    { term: 18, type: "PERCENT_OF_PRICE", value: "20.00" },
  ],
};
