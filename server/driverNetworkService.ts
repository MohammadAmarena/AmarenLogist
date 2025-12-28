import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { driverServiceProviders, users } from "../drizzle/schema";

/**
 * Driver Network Service
 * Manages driver service provider registration, verification, and management
 */

export async function registerDriverService(
  userId: number,
  companyName: string,
  taxNumber: string,
  businessRegistration?: string,
  insuranceCertificate?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(driverServiceProviders).values({
    userId,
    companyName,
    taxNumber,
    businessRegistration,
    insuranceCertificate,
    verificationStatus: "unverified",
    isActive: false,
  });

  return {
    success: true,
    serviceId: (result as any).insertId,
  };
}

export async function getPendingVerifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select({
      id: driverServiceProviders.id,
      userId: driverServiceProviders.userId,
      companyName: driverServiceProviders.companyName,
      taxNumber: driverServiceProviders.taxNumber,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.phone,
      createdAt: driverServiceProviders.createdAt,
    })
    .from(driverServiceProviders)
    .innerJoin(users, eq(driverServiceProviders.userId, users.id))
    .where(eq(driverServiceProviders.verificationStatus, "unverified"));
}

export async function verifyDriverService(serviceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(driverServiceProviders)
    .set({
      verificationStatus: "verified",
      isActive: true,
    })
    .where(eq(driverServiceProviders.id, serviceId));

  return { success: true };
}

export async function rejectDriverService(serviceId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(driverServiceProviders)
    .set({
      verificationStatus: "rejected",
      isActive: false,
    })
    .where(eq(driverServiceProviders.id, serviceId));

  return { success: true, reason };
}

export async function getActiveDriverServices() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select({
      id: driverServiceProviders.id,
      userId: driverServiceProviders.userId,
      companyName: driverServiceProviders.companyName,
      rating: driverServiceProviders.rating,
      completedOrders: driverServiceProviders.completedOrders,
      userName: users.name,
      userEmail: users.email,
    })
    .from(driverServiceProviders)
    .innerJoin(users, eq(driverServiceProviders.userId, users.id))
    .where(eq(driverServiceProviders.isActive, true));
}

export async function getDriverServiceById(serviceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(driverServiceProviders)
    .where(eq(driverServiceProviders.id, serviceId))
    .limit(1);

  return result[0] || null;
}

export async function getDriverServiceByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(driverServiceProviders)
    .where(eq(driverServiceProviders.userId, userId))
    .limit(1);

  return result[0] || null;
}

export async function updateDriverServiceRating(
  serviceId: number,
  newRating: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(driverServiceProviders)
    .set({ rating: newRating.toString() })
    .where(eq(driverServiceProviders.id, serviceId));

  return { success: true };
}

export async function incrementCompletedOrders(serviceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const service = await getDriverServiceById(serviceId);
  if (!service) throw new Error("Service not found");

  await db
    .update(driverServiceProviders)
    .set({
      completedOrders: (service.completedOrders || 0) + 1,
    })
    .where(eq(driverServiceProviders.id, serviceId));

  return { success: true };
}

export async function getDriverNetworkStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allServices = await db.select().from(driverServiceProviders);
  const activeServices = allServices.filter((s) => s.isActive);
  const verifiedServices = allServices.filter(
    (s) => s.verificationStatus === "verified"
  );
  const pendingServices = allServices.filter(
    (s) => s.verificationStatus === "unverified"
  );

  const totalCompletedOrders = allServices.reduce(
    (sum, s) => sum + (s.completedOrders || 0),
    0
  );
  const avgRating =
    activeServices.length > 0
      ? activeServices.reduce(
          (sum, s) => sum + parseFloat(s.rating || "0"),
          0
        ) / activeServices.length
      : 0;

  return {
    totalServices: allServices.length,
    activeServices: activeServices.length,
    verifiedServices: verifiedServices.length,
    pendingServices: pendingServices.length,
    totalCompletedOrders,
    avgRating: avgRating.toFixed(2),
  };
}
