import { eq, and, desc, lte, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { orders, marketplaceOffers, users } from "../drizzle/schema";

/**
 * Marketplace Service
 * Clients erstellen Aufträge, Fahrer machen Angebote, Clients akzeptieren beste Angebote
 */

export async function createMarketplaceOrder(
  clientId: number,
  vehicleType: string,
  pickupLocation: string,
  deliveryLocation: string,
  pickupDate: Date,
  totalPrice: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values({
    clientId,
    vehicleType,
    pickupLocation,
    deliveryLocation,
    pickupDate,
    totalPrice: totalPrice.toString(),
    insuranceFee: (totalPrice * 0.15).toString(),
    systemCommission: (totalPrice * 0.1).toString(),
    driverPayout: (totalPrice * 0.75).toString(),
    status: "erstellt",
    notes,
  });

  return {
    success: true,
    orderId: (result as any).insertId,
  };
}

export async function submitMarketplaceOffer(
  orderId: number,
  driverId: number,
  quotedPrice: number,
  estimatedDuration?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if driver already submitted offer
  const existingOffer = await db
    .select()
    .from(marketplaceOffers)
    .where(
      and(
        eq(marketplaceOffers.orderId, orderId),
        eq(marketplaceOffers.driverId, driverId)
      )
    )
    .limit(1);

  if (existingOffer[0]) {
    throw new Error("You already submitted an offer for this order");
  }

  const result = await db.insert(marketplaceOffers).values({
    orderId,
    driverId,
    quotedPrice: quotedPrice.toString(),
    estimatedDuration,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    offerStatus: "pending",
  });

  return {
    success: true,
    offerId: (result as any).insertId,
  };
}

export async function getMarketplaceOffers(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offers = await db
    .select({
      id: marketplaceOffers.id,
      orderId: marketplaceOffers.orderId,
      driverId: marketplaceOffers.driverId,
      driverName: users.name,
      driverEmail: users.email,
      quotedPrice: marketplaceOffers.quotedPrice,
      estimatedDuration: marketplaceOffers.estimatedDuration,
      driverRating: marketplaceOffers.driverRating,
      completedJobs: marketplaceOffers.completedJobs,
      offerStatus: marketplaceOffers.offerStatus,
      createdAt: marketplaceOffers.createdAt,
    })
    .from(marketplaceOffers)
    .innerJoin(users, eq(marketplaceOffers.driverId, users.id))
    .where(eq(marketplaceOffers.orderId, orderId));

  return offers.sort((a, b) => {
    const ratingDiff =
      parseFloat(b.driverRating || "0") - parseFloat(a.driverRating || "0");
    if (ratingDiff !== 0) return ratingDiff;
    return parseFloat(a.quotedPrice) - parseFloat(b.quotedPrice);
  });
}

export async function acceptMarketplaceOffer(offerId: number, orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offer = await db
    .select()
    .from(marketplaceOffers)
    .where(eq(marketplaceOffers.id, offerId))
    .limit(1);

  if (!offer[0]) throw new Error("Offer not found");

  await db
    .update(marketplaceOffers)
    .set({ offerStatus: "accepted" })
    .where(eq(marketplaceOffers.id, offerId));

  await db
    .update(marketplaceOffers)
    .set({ offerStatus: "rejected" })
    .where(
      and(
        eq(marketplaceOffers.orderId, orderId),
        eq(marketplaceOffers.offerStatus, "pending")
      )
    );

  await db
    .update(orders)
    .set({
      driverId: offer[0].driverId,
      totalPrice: offer[0].quotedPrice,
      insuranceFee: (parseFloat(offer[0].quotedPrice) * 0.15).toString(),
      systemCommission: (parseFloat(offer[0].quotedPrice) * 0.1).toString(),
      driverPayout: (parseFloat(offer[0].quotedPrice) * 0.75).toString(),
      status: "bestätigt",
    })
    .where(eq(orders.id, orderId));

  return {
    success: true,
    offerId,
    driverId: offer[0].driverId,
    acceptedPrice: offer[0].quotedPrice,
  };
}

export async function rejectMarketplaceOffer(offerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(marketplaceOffers)
    .set({ offerStatus: "rejected" })
    .where(eq(marketplaceOffers.id, offerId));

  return { success: true };
}

export async function getAvailableOrdersForDriver(driverId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const availableOrders = await db
    .select({
      id: orders.id,
      vehicleType: orders.vehicleType,
      pickupLocation: orders.pickupLocation,
      deliveryLocation: orders.deliveryLocation,
      pickupDate: orders.pickupDate,
      totalPrice: orders.totalPrice,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.status, "erstellt"));

  const driverOffers = await db
    .select({ orderId: marketplaceOffers.orderId })
    .from(marketplaceOffers)
    .where(eq(marketplaceOffers.driverId, driverId));

  const driverOrderIds = new Set(driverOffers.map((o) => o.orderId));

  return availableOrders.filter((o) => !driverOrderIds.has(o.id));
}

export async function compareOffers(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offers = await db
    .select({
      driverId: marketplaceOffers.driverId,
      driverName: users.name,
      quotedPrice: marketplaceOffers.quotedPrice,
      estimatedDuration: marketplaceOffers.estimatedDuration,
      driverRating: marketplaceOffers.driverRating,
      completedJobs: marketplaceOffers.completedJobs,
    })
    .from(marketplaceOffers)
    .innerJoin(users, eq(marketplaceOffers.driverId, users.id))
    .where(
      and(
        eq(marketplaceOffers.orderId, orderId),
        eq(marketplaceOffers.offerStatus, "pending")
      )
    );

  if (offers.length === 0) {
    return {
      offers: [],
      stats: {
        totalOffers: 0,
        minPrice: null,
        maxPrice: null,
        avgPrice: null,
        bestRated: null,
      },
    };
  }

  const prices = offers.map((o) => parseFloat(o.quotedPrice));
  const stats = {
    totalOffers: offers.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    bestRated: offers.reduce((best, current) =>
      parseFloat(current.driverRating || "0") >
      parseFloat(best.driverRating || "0")
        ? current
        : best
    ),
  };

  return { offers, stats };
}
