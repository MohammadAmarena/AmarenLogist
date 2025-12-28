import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createCheckoutSession,
  handlePaymentSuccess,
  handleStripeWebhook,
  verifyWebhookSignature,
  getPaymentHistory,
  refundPayment,
} from "../stripePaymentService";

export const stripeRouter = router({
  /**
   * Create a checkout session for an order
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        totalAmount: z.number().positive(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await createCheckoutSession(
          input.orderId,
          ctx.user!.id,
          input.totalAmount,
          input.successUrl,
          input.cancelUrl
        );

        return {
          success: true,
          sessionId: result.sessionId,
          url: result.url,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Handle payment success callback
   */
  handlePaymentSuccess: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await handlePaymentSuccess(input.sessionId);
        return {
          success: true,
          orderId: result.orderId,
          amount: result.amount,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Handle Stripe webhook
   */
  handleWebhook: publicProcedure
    .input(
      z.object({
        body: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const event = await verifyWebhookSignature(input.body, input.signature);
        const result = await handleStripeWebhook(event);

        return {
          success: true,
          result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get payment history for current user
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const payments = await getPaymentHistory(ctx.user!.id);
      return {
        success: true,
        payments,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),

  /**
   * Refund a payment
   */
  refundPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await refundPayment(
          input.paymentId,
          input.reason || "No reason provided"
        );

        return {
          success: true,
          refundId: result.refundId,
          amount: result.amount,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
