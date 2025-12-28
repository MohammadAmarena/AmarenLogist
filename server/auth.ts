import bcrypt from "bcryptjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Login with username and password
 */
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export async function loginWithPassword(
  username: string,
  password: string,
  req: any,
  res: any
) {
  const user = await db.getUserByUsername(username);

  if (!user || !user.passwordHash) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Ungültige Anmeldedaten",
    });
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Ungültige Anmeldedaten",
    });
  }

  // Update last sign in
  await db.updateUser(user.id, {
    lastSignedIn: new Date(),
  });

  // Create session token
  const sessionToken = await sdk.createSessionToken(user.openId ?? `user_${user.id}`, {
    name: user.name,
    expiresInMs: ONE_YEAR_MS,
  });

  // Set cookie
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

  // Log activity
  await db.createActivityLog({
    userId: user.id,
    action: "login",
    entityType: "user",
    entityId: user.id,
    details: `User ${user.username} logged in`,
    ipAddress: req.ip || req.connection?.remoteAddress,
  });

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Register new user (client or driver)
 */
export const registerSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(6),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["client", "driver"]),
  // Driver-specific fields
  licenseNumber: z.string().optional(),
  vehicleType: z.string().optional(),
  experienceYears: z.number().optional(),
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
  // Check if username exists
  const existingUser = await db.getUserByUsername(data.username);
  if (existingUser) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Benutzername bereits vergeben",
    });
  }

  // Check if email exists
  const existingEmail = await db.getUserByEmail(data.email);
  if (existingEmail) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "E-Mail bereits registriert",
    });
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const result = await db.createUser({
    username: data.username,
    passwordHash,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    role: data.role,
    loginMethod: "password",
  });

  const userId = Number((result as any).insertId);

  // If driver, create driver profile
  if (data.role === "driver") {
    await db.createDriverProfile({
      userId,
      licenseNumber: data.licenseNumber,
      vehicleType: data.vehicleType,
      experienceYears: data.experienceYears,
    });
  }

  // Log activity
  await db.createActivityLog({
    userId,
    action: "register",
    entityType: "user",
    entityId: userId,
    details: `New ${data.role} registered: ${data.username}`,
  });

  return {
    success: true,
    message: "Registrierung erfolgreich",
  };
}

/**
 * Initialize default admin accounts
 */
export async function initializeAdminAccounts() {
  // Create Super Admin (amarenlogist)
  const superAdmin = await db.getUserByUsername("amarenlogist");
  if (!superAdmin) {
    const passwordHash = await hashPassword("amarenlogist555");
    await db.createUser({
      username: "amarenlogist",
      passwordHash,
      name: "Super Administrator",
      email: "admin@amarenlogist.com",
      role: "super_admin",
      loginMethod: "password",
    });
    console.log("[Auth] Super Admin account created: amarenlogist");
  }

  // Create Admin (zetologist)
  const admin = await db.getUserByUsername("zetologist");
  if (!admin) {
    const passwordHash = await hashPassword("zetologist123");
    await db.createUser({
      username: "zetologist",
      passwordHash,
      name: "Administrator",
      email: "admin@zetologist.com",
      role: "admin",
      loginMethod: "password",
    });
    console.log("[Auth] Admin account created: zetologist");
  }

  // Initialize default system config
  const insuranceRate = await db.getSystemConfig("insurance_rate");
  if (!insuranceRate) {
    await db.setSystemConfig({
      configKey: "insurance_rate",
      configValue: "0.15",
      description: "Versicherungsgebühr (15%)",
    });
  }

  const defaultCommission = await db.getSystemConfig("default_commission");
  if (!defaultCommission) {
    await db.setSystemConfig({
      configKey: "default_commission",
      configValue: "100",
      description: "Standard-Systemprovision in Euro",
    });
  }
}
