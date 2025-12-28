import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { hashPassword, verifyPassword } from "./auth";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Authentication", () => {
  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);
      
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should verify correct password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("wrongpassword", hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe("Admin Accounts", () => {
    it("should have super admin account (amarenlogist)", async () => {
      const user = await db.getUserByUsername("amarenlogist");
      
      expect(user).toBeTruthy();
      expect(user?.role).toBe("super_admin");
      expect(user?.username).toBe("amarenlogist");
    });

    it("should have admin account (zetologist)", async () => {
      const user = await db.getUserByUsername("zetologist");
      
      expect(user).toBeTruthy();
      expect(user?.role).toBe("admin");
      expect(user?.username).toBe("zetologist");
    });

    it("super admin should be able to login", async () => {
      const user = await db.getUserByUsername("amarenlogist");
      expect(user).toBeTruthy();
      expect(user?.passwordHash).toBeTruthy();
      
      if (user?.passwordHash) {
        const isValid = await verifyPassword("amarenlogist555", user.passwordHash);
        expect(isValid).toBe(true);
      }
    });
  });

  describe("Role-based Access Control", () => {
    it("should allow super admin to access admin-only endpoints", async () => {
      const superAdmin: AuthenticatedUser = {
        id: 1,
        openId: "super-admin",
        email: "admin@amarenlogist.com",
        name: "Super Admin",
        username: "amarenlogist",
        loginMethod: "password",
        role: "super_admin",
        passwordHash: null,
        phone: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createMockContext(superAdmin);
      const caller = appRouter.createCaller(ctx);

      const users = await caller.users.getAll();
      expect(Array.isArray(users)).toBe(true);
    });

    it("should allow admin to view but not modify", async () => {
      const admin: AuthenticatedUser = {
        id: 2,
        openId: "admin",
        email: "admin@zetologist.com",
        name: "Admin",
        username: "zetologist",
        loginMethod: "password",
        role: "admin",
        passwordHash: null,
        phone: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createMockContext(admin);
      const caller = appRouter.createCaller(ctx);

      // Should be able to view
      const users = await caller.users.getAll();
      expect(Array.isArray(users)).toBe(true);

      // Should NOT be able to delete (super admin only)
      await expect(
        caller.users.delete({ id: 999 })
      ).rejects.toThrow("Nur Super Admin hat Zugriff");
    });

    it("should deny client access to admin endpoints", async () => {
      const client: AuthenticatedUser = {
        id: 3,
        openId: "client",
        email: "client@example.com",
        name: "Test Client",
        username: "testclient",
        loginMethod: "password",
        role: "client",
        passwordHash: null,
        phone: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createMockContext(client);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.getAll()
      ).rejects.toThrow("Nur Administratoren haben Zugriff");
    });

    it("should deny driver access to admin endpoints", async () => {
      const driver: AuthenticatedUser = {
        id: 4,
        openId: "driver",
        email: "driver@example.com",
        name: "Test Driver",
        username: "testdriver",
        loginMethod: "password",
        role: "driver",
        passwordHash: null,
        phone: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createMockContext(driver);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.getAll()
      ).rejects.toThrow("Nur Administratoren haben Zugriff");
    });
  });
});
