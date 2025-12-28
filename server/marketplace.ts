import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { orders, marketplaceOffers, users } from "../drizzle/schema";

export async function createMarketplaceOrder(
  clientId: number,
  vehicleType: string,
  pickupLocation: string,
  deliveryLocation: string,
  pickupDate: Date,
  totalPrice: number
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
  });

  return { success: true, orderId: (result as any).insertId };
}

export async function submitOffer(
  orderId: number,
  driverId: number,
  quotedPrice: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(marketplaceOffers).values({
    orderId,
    driverId,
    quotedPrice: quotedPrice.toString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    offerStatus: "pending",
  });

  return { success: true, offerId: (result as any).insertId };
}

export async function getOffers(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(marketplaceOffers)
    .innerJoin(users, eq(marketplaceOffers.driverId, users.id))
    .where(eq(marketplaceOffers.orderId, orderId))
    .orderBy(desc(marketplaceOffers.driverRating));
}

export async function acceptOffer(offerId: number, orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const offer = await db
    .select()
    .from(marketplaceOffers)
    .where(eq(marketplaceOffers.id, offerId))
    .limit(1);

  if (!offer[0]) throw new Error("Offer not found");

  // Accept this offer
  await db
    .update(marketplaceOffers)
    .set({ offerStatus: "accepted" })
    .where(eq(marketplaceOffers.id, offerId));

  // Reject others
  await db
    .update(marketplaceOffers)
    .set({ offerStatus: "rejected" })
    .where(
      and(
        eq(marketplaceOffers.orderId, orderId),
        eq(marketplaceOffers.offerStatus, "pending")
      )
    );

  // Update order
  await db
    .update(orders)
    .set({
      driverId: offer[0].driverId,
      totalPrice: offer[0].quotedPrice,
      status: "bestätigt",
    })
    .where(eq(orders.id, orderId));

  return { success: true };
}
