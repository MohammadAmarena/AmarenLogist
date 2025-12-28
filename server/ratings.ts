import { eq, avg, count } from "drizzle-orm";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";

export interface Rating {
  orderId: number;
  driverId: number;
  clientId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export async function submitRating(
  orderId: number,
  driverId: number,
  clientId: number,
  rating: number,
  comment?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Update order with rating
  await db
    .update(orders)
    .set({
      driverRating: rating,
      driverFeedback: comment || null,
    })
    .where(eq(orders.id, orderId));

  console.log(`[Rating] Fahrer #${driverId} erhielt ${rating} Sterne für Auftrag #${orderId}`);

  return { success: true, rating };
}

export async function getDriverRatings(driverId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      averageRating: avg(orders.driverRating),
      totalRatings: count(orders.id),
    })
    .from(orders)
    .where(eq(orders.driverId, driverId));

  return {
    averageRating: result[0]?.averageRating ? parseFloat(result[0].averageRating.toString()) : 0,
    totalRatings: result[0]?.totalRatings || 0,
  };
}

export async function getTopDrivers(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      driverId: orders.driverId,
      averageRating: avg(orders.driverRating),
      totalOrders: count(orders.id),
    })
    .from(orders)
    .where(eq(orders.status, "abgeschlossen"))
    .groupBy(orders.driverId)
    .orderBy((t) => t.averageRating)
    .limit(limit);

  return result;
}

export async function isVerifiedDriver(driverId: number): Promise<boolean> {
  const ratings = await getDriverRatings(driverId);
  // Verified: mindestens 4.5 Sterne und mindestens 10 Bewertungen
  return ratings.averageRating >= 4.5 && ratings.totalRatings >= 10;
}

export async function getDriverFeedback(driverId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      orderId: orders.id,
      rating: orders.driverRating,
      feedback: orders.driverFeedback,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.driverId, driverId))
    .orderBy((t) => t.createdAt);

  return result;
}
