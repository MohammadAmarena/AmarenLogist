import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as marketplace from "../marketplace";

export const marketplaceRouter = router({
    createOrder: protectedProcedure
      .input(z.object({
        vehicleType: z.string(),
        pickupLocation: z.string(),
        deliveryLocation: z.string(),
        pickupDate: z.date(),
        totalPrice: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return marketplace.createMarketplaceOrder(
          ctx.user.id,
          input.vehicleType,
          input.pickupLocation,
          input.deliveryLocation,
          input.pickupDate,
          input.totalPrice
        );
      }),

    getOffers: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return marketplace.getOffers(input.orderId);
      }),

    submitOffer: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        quotedPrice: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return marketplace.submitOffer(
          input.orderId,
          ctx.user.id,
          input.quotedPrice
        );
      }),

    acceptOffer: protectedProcedure
      .input(z.object({ offerId: z.number(), orderId: z.number() }))
      .mutation(async ({ input }) => {
        return marketplace.acceptOffer(input.offerId, input.orderId);
      }),
});
