import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as driverNetwork from "../driverNetwork";

export const driverNetworkRouter = router({
  register: protectedProcedure
    .input(
      z.object({
        companyName: z.string(),
        taxNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return driverNetwork.registerDriverService(
        ctx.user.id,
        input.companyName,
        input.taxNumber
      );
    }),

  getPending: protectedProcedure.query(async () => {
    return driverNetwork.getPendingVerifications();
  }),

  verify: protectedProcedure
    .input(
      z.object({
        serviceId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return driverNetwork.verifyDriverService(input.serviceId, ctx.user.id);
    }),
});
