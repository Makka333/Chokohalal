export type ApplicationStatus =
  | "NEW"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export type OfferStatus = "ACTIVE" | "INACTIVE";

export type MarkupType = "FIXED_AMOUNT" | "PERCENT_OF_PRICE";
export type Tariff = "WITH_DOWN_PAYMENT" | "NO_DOWN_PAYMENT";

export type TermMarkupRule = {
  term: number;
  type: MarkupType;
  value: string;
};

export type DownPaymentRule = {
  minPercent: string;
};

export type OfferRules = {
  availableTerms: number[];
  downPaymentRule: DownPaymentRule;
  markupRule: TermMarkupRule[];
};

export type PaymentScheduleItem = {
  number: number;
  date: string;
  amount: string;
  remaining: string;
};

export type CalculationResult = {
  productPrice: string;
  term: number;
  initialPayment: string;
  markup: string;
  totalPrice: string;
  scheduledAmount: string;
  periodicPayment: string;
  paymentCount: number;
  paymentSchedule: PaymentScheduleItem[];
  lastPaymentDiffers: boolean;
  tariff?: Tariff;
  initialPaymentPercent?: string;
  financedAmount?: string;
  overpayment?: string;
  totalClientCost?: string;
  markupRate?: string;
};

export type PublicOffer = {
  id: string;
  name: string;
  description: string;
  minAmount: string;
  maxAmount: string;
  status: OfferStatus;
  availableTerms: number[];
  downPaymentRule: DownPaymentRule;
  markupRule: TermMarkupRule[];
};
