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
  if (!process.env.DATABASE_URL) {
    return [DEFAULT_OFFER];
  }

  try {
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
  } catch (error) {
    console.error("Offers database is unavailable; using the default offer", error);
    return [DEFAULT_OFFER];
  }
}

export async function getOfferForCalculation(offerId?: string): Promise<PublicOffer> {
  if (!process.env.DATABASE_URL) {
    return DEFAULT_OFFER;
  }

  if (offerId) {
    try {
      const offer = await prisma.offer.findUnique({ where: { id: offerId } });

      if (!offer || offer.status !== "ACTIVE") {
        throw new Error("Offer not found");
      }

      return serializeOffer(offer);
    } catch (error) {
      if (error instanceof Error && error.message === "Offer not found") {
        throw error;
      }

      console.error("Offer database is unavailable; using the default offer", error);
      return DEFAULT_OFFER;
    }
  }

  const [offer] = await getActiveOffers();

  if (!offer) {
    throw new Error("Offer not found");
  }

  return offer;
}
