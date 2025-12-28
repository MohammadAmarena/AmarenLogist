import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { loginSchema, registerSchema, loginWithPassword, registerUser } from "./auth";
import { stripeRouter } from "./routers/stripe";
import { marketplaceRouter } from "./routers/marketplace";
import { driverNetworkRouter } from "./routers/driverNetwork";

// ============ ROLE-BASED MIDDLEWARE ============

const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Nur Super Admin hat Zugriff auf diese Funktion",
    });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Nur Administratoren haben Zugriff auf diese Funktion",
    });
  }
  return next({ ctx });
});

const clientProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "client" && ctx.user.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Nur Auftraggeber haben Zugriff auf diese Funktion",
    });
  }
  return next({ ctx });
});

const driverProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "driver" && ctx.user.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Nur Fahrer haben Zugriff auf diese Funktion",
    });
  }
  return next({ ctx });
});

// ============ ROUTERS ============

export const appRouter = router({
  system: systemRouter,
  stripe: stripeRouter,
  marketplace: marketplaceRouter,
  driverNetwork: driverNetworkRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ input, ctx }) => {
        return loginWithPassword(input.username, input.password, ctx.req, ctx.res);
      }),

    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ input }) => {
        return registerUser(input);
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ USER MANAGEMENT (Super Admin only) ============
  users: router({
    getAll: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getUserById(input.id);
      }),

    getByRole: adminProcedure
      .input(z.object({ role: z.enum(["super_admin", "admin", "client", "driver"]) }))
      .query(async ({ input }) => {
        return db.getUsersByRole(input.role);
      }),

    update: superAdminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        role: z.enum(["super_admin", "admin", "client", "driver"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await db.updateUser(id, updates);
        
        await db.createActivityLog({
          userId: ctx.user.id,
          action: "update_user",
          entityType: "user",
          entityId: id,
          details: `User ${id} updated by ${ctx.user.username}`,
        });

        return { success: true };
      }),

    delete: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteUser(input.id);
        
        await db.createActivityLog({
          userId: ctx.user.id,
          action: "delete_user",
          entityType: "user",
          entityId: input.id,
          details: `User ${input.id} deleted by ${ctx.user.username}`,
        });

        return { success: true };
      }),
  }),

  // ============ DRIVER PROFILES ============
  drivers: router({
    getAll: adminProcedure.query(async () => {
      return db.getAllDriverProfiles();
    }),

    getMyProfile: driverProcedure.query(async ({ ctx }) => {
      return db.getDriverProfileByUserId(ctx.user.id);
    }),

    updateMyProfile: driverProcedure
      .input(z.object({
        licenseNumber: z.string().optional(),
        vehicleType: z.string().optional(),
        experienceYears: z.number().optional(),
        isAvailable: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateDriverProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ============ ORDERS ============
  orders: router({
    getAll: adminProcedure.query(async () => {
      return db.getAllOrders();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Auftrag nicht gefunden" });
        }

        // Check access rights
        if (
          ctx.user.role !== "super_admin" &&
          ctx.user.role !== "admin" &&
          order.clientId !== ctx.user.id &&
          order.driverId !== ctx.user.id
        ) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff auf diesen Auftrag" });
        }

        return order;
      }),

    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "client") {
        return db.getOrdersByClientId(ctx.user.id);
      } else if (ctx.user.role === "driver") {
        return db.getOrdersByDriverId(ctx.user.id);
      } else if (ctx.user.role === "super_admin" || ctx.user.role === "admin") {
        return db.getAllOrders();
      }
      return [];
    }),

    getAvailable: driverProcedure.query(async () => {
      return db.getAvailableOrders();
    }),

    create: clientProcedure
      .input(z.object({
        vehicleType: z.string(),
        vehicleMake: z.string().optional(),
        vehicleModel: z.string().optional(),
        pickupLocation: z.string(),
        deliveryLocation: z.string(),
        pickupDate: z.date(),
        totalPrice: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Calculate fees
        const insuranceFee = input.totalPrice * 0.15;
        const systemCommissionConfig = await db.getSystemConfig("default_commission");
        const systemCommission = systemCommissionConfig 
          ? parseFloat(systemCommissionConfig.configValue) 
          : 100;
        const driverPayout = input.totalPrice - insuranceFee - systemCommission;

        const result = await db.createOrder({
          clientId: ctx.user.id,
          vehicleType: input.vehicleType,
          vehicleMake: input.vehicleMake,
          vehicleModel: input.vehicleModel,
          pickupLocation: input.pickupLocation,
          deliveryLocation: input.deliveryLocation,
          pickupDate: input.pickupDate,
          totalPrice: input.totalPrice.toString(),
          insuranceFee: insuranceFee.toString(),
          systemCommission: systemCommission.toString(),
          driverPayout: driverPayout.toString(),
          notes: input.notes,
          status: "erstellt",
        });

        const orderId = Number((result as any).insertId);

        await db.createActivityLog({
          userId: ctx.user.id,
          action: "create_order",
          entityType: "order",
          entityId: orderId,
          details: `Order created: ${input.vehicleType} from ${input.pickupLocation} to ${input.deliveryLocation}`,
        });

        return { success: true, orderId };
      }),

    assignDriver: superAdminProcedure
      .input(z.object({
        orderId: z.number(),
        driverId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateOrder(input.orderId, {
          driverId: input.driverId,
          status: "bestätigt",
        });

        await db.createActivityLog({
          userId: ctx.user.id,
          action: "assign_driver",
          entityType: "order",
          entityId: input.orderId,
          details: `Driver ${input.driverId} assigned to order ${input.orderId}`,
        });

        return { success: true };
      }),

    acceptOrder: driverProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.orderId);
        
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Auftrag nicht gefunden" });
        }

        if (order.status !== "erstellt") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Auftrag kann nicht mehr angenommen werden" });
        }

        await db.updateOrder(input.orderId, {
          driverId: ctx.user.id,
          status: "bestätigt",
        });

        await db.createActivityLog({
          userId: ctx.user.id,
          action: "accept_order",
          entityType: "order",
          entityId: input.orderId,
          details: `Order ${input.orderId} accepted by driver ${ctx.user.id}`,
        });

        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["erstellt", "bestätigt", "unterwegs", "abgeschlossen", "storniert"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.orderId);
        
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Auftrag nicht gefunden" });
        }

        // Check permissions
        const isDriver = ctx.user.role === "driver" && order.driverId === ctx.user.id;
        const isClient = ctx.user.role === "client" && order.clientId === ctx.user.id;
        const isAdmin = ctx.user.role === "super_admin" || ctx.user.role === "admin";
        
        if (!isDriver && !isClient && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff auf diesen Auftrag" });
        }

        await db.updateOrder(input.orderId, {
          status: input.status,
          ...(input.status === "abgeschlossen" ? { deliveryDate: new Date() } : {}),
        });

        // Update driver stats if completed
        if (input.status === "abgeschlossen" && order.driverId) {
          const profile = await db.getDriverProfileByUserId(order.driverId);
          if (profile) {
            const newEarnings = parseFloat(profile.totalEarnings) + parseFloat(order.driverPayout);
            await db.updateDriverProfile(order.driverId, {
              totalEarnings: newEarnings.toString(),
              completedOrders: profile.completedOrders + 1,
            });

            // Create payout record
            await db.createPayout({
              orderId: input.orderId,
              driverId: order.driverId,
              amount: order.driverPayout,
              payoutStatus: "pending",
            });
          }
        }

        await db.createActivityLog({
          userId: ctx.user.id,
          action: "update_order_status",
          entityType: "order",
          entityId: input.orderId,
          details: `Order ${input.orderId} status changed to ${input.status}`,
        });

        return { success: true };
      }),

    delete: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteOrder(input.id);
        
        await db.createActivityLog({
          userId: ctx.user.id,
          action: "delete_order",
          entityType: "order",
          entityId: input.id,
          details: `Order ${input.id} deleted`,
        });

        return { success: true };
      }),
  }),

  // ============ STATISTICS ============
  statistics: router({
    overview: adminProcedure.query(async () => {
      const stats = await db.getOrderStatistics();
      const statusStats = await db.getOrderStatisticsByStatus();
      const allUsers = await db.getAllUsers();
      
      return {
        orders: stats,
        statusBreakdown: statusStats,
        userCounts: {
          total: allUsers.length,
          clients: allUsers.filter(u => u.role === "client").length,
          drivers: allUsers.filter(u => u.role === "driver").length,
          admins: allUsers.filter(u => u.role === "admin" || u.role === "super_admin").length,
        },
      };
    }),

    myStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "client") {
        const orders = await db.getOrdersByClientId(ctx.user.id);
        return {
          totalOrders: orders.length,
          completedOrders: orders.filter(o => o.status === "abgeschlossen").length,
          activeOrders: orders.filter(o => o.status !== "abgeschlossen" && o.status !== "storniert").length,
          totalSpent: orders.reduce((sum, o) => sum + parseFloat(o.totalPrice), 0),
        };
      } else if (ctx.user.role === "driver") {
        const profile = await db.getDriverProfileByUserId(ctx.user.id);
        const orders = await db.getOrdersByDriverId(ctx.user.id);
        return {
          totalOrders: orders.length,
          completedOrders: profile?.completedOrders || 0,
          activeOrders: orders.filter(o => o.status !== "abgeschlossen" && o.status !== "storniert").length,
          totalEarnings: parseFloat(profile?.totalEarnings || "0"),
          rating: parseFloat(profile?.rating || "0"),
        };
      }
      return null;
    }),
  }),

  // ============ SYSTEM CONFIG (Super Admin only) ============
  config: router({
    getAll: adminProcedure.query(async () => {
      return db.getAllSystemConfig();
    }),

    get: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return db.getSystemConfig(input.key);
      }),

    set: superAdminProcedure
      .input(z.object({
        configKey: z.string(),
        configValue: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.setSystemConfig({
          ...input,
          updatedBy: ctx.user.id,
        });

        await db.createActivityLog({
          userId: ctx.user.id,
          action: "update_config",
          entityType: "config",
          details: `Config ${input.configKey} updated to ${input.configValue}`,
        });

        return { success: true };
      }),
  }),

  // ============ ACTIVITY LOGS (Admin only) ============
  logs: router({
    getRecent: adminProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getActivityLogs(input.limit);
      }),

    getByUser: adminProcedure
      .input(z.object({ userId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getActivityLogsByUserId(input.userId, input.limit);
      }),
  }),

  // ============ PAYMENTS ============
  payments: router({
    getAll: adminProcedure.query(async () => {
      return db.getAllPayments();
    }),

    getByOrder: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Auftrag nicht gefunden" });
        }

        // Check access
        if (
          ctx.user.role !== "super_admin" &&
          ctx.user.role !== "admin" &&
          order.clientId !== ctx.user.id
        ) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff" });
        }

        return db.getPaymentByOrderId(input.orderId);
      }),
  }),

  // ============ PAYOUTS ============
  payouts: router({
    getAll: adminProcedure.query(async () => {
      return db.getAllPayouts();
    }),

    getMyPayouts: driverProcedure.query(async ({ ctx }) => {
      return db.getPayoutsByDriverId(ctx.user.id);
    }),

    updateStatus: superAdminProcedure
      .input(z.object({
        payoutId: z.number(),
        status: z.enum(["pending", "processing", "completed", "failed"]),
        transactionId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updatePayout(input.payoutId, {
          payoutStatus: input.status,
          transactionId: input.transactionId,
        });

        await db.createActivityLog({
          userId: ctx.user.id,
          action: "update_payout",
          entityType: "payout",
          entityId: input.payoutId,
          details: `Payout ${input.payoutId} status changed to ${input.status}`,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
