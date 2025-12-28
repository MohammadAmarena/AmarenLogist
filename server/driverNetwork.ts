import { getDb } from "./db";
import { driverServiceProviders, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function registerDriverService(
  userId: number,
  companyName: string,
  taxNumber: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(driverServiceProviders).values({
    userId,
    companyName,
    taxNumber,
    verificationStatus: "unverified",
    isActive: false,
  });

  return { success: true, serviceId: (result as any).insertId };
}

export async function getPendingVerifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(driverServiceProviders)
    .where(eq(driverServiceProviders.verificationStatus, "unverified"));
}

export async function verifyDriverService(serviceId: number, adminId: number) {
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
