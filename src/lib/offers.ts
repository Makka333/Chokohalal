import Decimal from "decimal.js";
import type { Offer } from "@prisma/client";
import { DEFAULT_OFFER } from "@/lib/defaults";
import { prisma } from "@/lib/db";
import type { PublicOffer } from "@/types";

export function serializeOffer(offer: Offer): PublicOffer {
  return {
    id: offer.id,
    name: offer.name,
    description: offer.description,
    minAmount: new Decimal(offer.minAmount.toString()).toFixed(2),
    maxAmount: new Decimal(offer.maxAmount.toString()).toFixed(2),
    status: offer.status,
    availableTerms: offer.availableTerms as number[],
    downPaymentRule: offer.downPaymentRule as PublicOffer["downPaymentRule"],
    markupRule: offer.markupRule as PublicOffer["markupRule"],
  };
}

export async function getActiveOffers(): Promise<PublicOffer[]> {
  const offers = await prisma.offer.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });

  if (offers.length > 0) {
    return offers.map(serializeOffer);
  }

  const created = await prisma.offer.create({
    data: {
      name: DEFAULT_OFFER.name,
      description: DEFAULT_OFFER.description,
      minAmount: DEFAULT_OFFER.minAmount,
      maxAmount: DEFAULT_OFFER.maxAmount,
      availableTerms: DEFAULT_OFFER.availableTerms,
      downPaymentRule: DEFAULT_OFFER.downPaymentRule,
      markupRule: DEFAULT_OFFER.markupRule,
      status: "ACTIVE",
    },
  });

  return [serializeOffer(created)];
}

export async function getOfferForCalculation(offerId?: string): Promise<PublicOffer> {
  if (offerId) {
    const offer = await prisma.offer.findUnique({ where: { id: offerId } });

    if (!offer || offer.status !== "ACTIVE") {
      throw new Error("Offer not found");
    }

    return serializeOffer(offer);
  }

  const [offer] = await getActiveOffers();

  if (!offer) {
    throw new Error("Offer not found");
  }

  return offer;
}
