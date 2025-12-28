import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  driverProfiles, 
  orders, 
  payments, 
  payouts, 
  systemConfig, 
  activityLogs,
  InsertDriverProfile,
  InsertOrder,
  InsertPayment,
  InsertPayout,
  InsertSystemConfig,
  InsertActivityLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER MANAGEMENT ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId && !user.username) {
    throw new Error("User openId or username is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId ?? null,
      name: user.name ?? "",
      email: user.email ?? null,
      username: user.username ?? null,
      passwordHash: user.passwordHash ?? null,
      loginMethod: user.loginMethod ?? "password",
      role: user.role ?? "client",
      phone: user.phone ?? null,
      address: user.address ?? null,
      lastSignedIn: user.lastSignedIn ?? new Date(),
    };

    const updateSet: Record<string, unknown> = {
      lastSignedIn: new Date(),
    };

    if (user.name !== undefined) updateSet.name = user.name;
    if (user.email !== undefined) updateSet.email = user.email;
    if (user.phone !== undefined) updateSet.phone = user.phone;
    if (user.address !== undefined) updateSet.address = user.address;

    if (user.openId === ENV.ownerOpenId) {
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(user);
  return result;
}

export async function updateUser(id: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(updates).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(users).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUsersByRole(role: "super_admin" | "admin" | "client" | "driver") {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).where(eq(users.role, role));
}

// ============ DRIVER PROFILES ============

export async function createDriverProfile(profile: InsertDriverProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(driverProfiles).values(profile);
  return result;
}

export async function getDriverProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDriverProfile(userId: number, updates: Partial<InsertDriverProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(driverProfiles).set(updates).where(eq(driverProfiles.userId, userId));
}

export async function getAllDriverProfiles() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(driverProfiles).orderBy(desc(driverProfiles.createdAt));
}

// ============ ORDERS ============

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values(order);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrder(id: number, updates: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set(updates).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(orders).where(eq(orders.id, id));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrdersByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.createdAt));
}

export async function getOrdersByDriverId(driverId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).where(eq(orders.driverId, driverId)).orderBy(desc(orders.createdAt));
}

export async function getAvailableOrders() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).where(eq(orders.status, "erstellt")).orderBy(desc(orders.createdAt));
}

export async function getOrdersByStatus(status: "erstellt" | "bestätigt" | "unterwegs" | "abgeschlossen" | "storniert") {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt));
}

// ============ PAYMENTS ============

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(payment);
  return result;
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePayment(id: number, updates: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set(updates).where(eq(payments.id, id));
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(payments).orderBy(desc(payments.createdAt));
}

// ============ PAYOUTS ============

export async function createPayout(payout: InsertPayout) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payouts).values(payout);
  return result;
}

export async function getPayoutById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(payouts).where(eq(payouts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPayoutsByDriverId(driverId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(payouts).where(eq(payouts.driverId, driverId)).orderBy(desc(payouts.createdAt));
}

export async function updatePayout(id: number, updates: Partial<InsertPayout>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payouts).set(updates).where(eq(payouts.id, id));
}

export async function getAllPayouts() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(payouts).orderBy(desc(payouts.createdAt));
}

// ============ SYSTEM CONFIG ============

export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(systemConfig).where(eq(systemConfig.configKey, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSystemConfig(config: InsertSystemConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(systemConfig).values(config).onDuplicateKeyUpdate({
    set: {
      configValue: config.configValue,
      description: config.description,
      updatedBy: config.updatedBy,
      updatedAt: new Date(),
    },
  });
}

export async function getAllSystemConfig() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(systemConfig).orderBy(systemConfig.configKey);
}

// ============ ACTIVITY LOGS ============

export async function createActivityLog(log: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(activityLogs).values(log);
  } catch (error) {
    console.error("[Database] Failed to create activity log:", error);
  }
}

export async function getActivityLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

export async function getActivityLogsByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityLogs).where(eq(activityLogs.userId, userId)).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

// ============ STATISTICS ============

export async function getOrderStatistics() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    totalOrders: sql<number>`COUNT(*)`,
    totalRevenue: sql<string>`SUM(${orders.totalPrice})`,
    totalInsurance: sql<string>`SUM(${orders.insuranceFee})`,
    totalCommission: sql<string>`SUM(${orders.systemCommission})`,
    totalDriverPayouts: sql<string>`SUM(${orders.driverPayout})`,
  }).from(orders);

  return result[0];
}

export async function getOrderStatisticsByStatus() {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    status: sql<string>`${orders.status}`,
    count: sql<number>`COUNT(*)`,
    totalRevenue: sql<string>`SUM(${orders.totalPrice})`,
  }).from(orders).groupBy(sql`${orders.status}`);
}
