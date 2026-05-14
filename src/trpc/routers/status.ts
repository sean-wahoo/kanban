import { authProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const statusRouter = createTRPCRouter({
  getStatus: baseProcedure
    .input(
      z.object({
        statusId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const status = await ctx.prisma.status.findUniqueOrThrow({
          where: {
            id: input.statusId,
          },
        });
        return status;
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  getStatuses: baseProcedure.query(async ({ ctx }) => {
    try {
      const statuses = await ctx.prisma.status.findMany();
      return statuses;
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),
  updateStatusOrders: authProcedure
    .input(
      z.object({
        statuses: z.array(
          z.object({
            id: z.string(),
            newOrder: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updatePromises = [];
        for (const status of input.statuses) {
          updatePromises.push(
            ctx.prisma.status.update({
              where: { id: status.id },
              data: { order: status.newOrder },
            }),
          );
        }

        return await Promise.all(updatePromises);
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  deleteStatus: authProcedure
    .input(
      z.object({
        statusId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.status.delete({
          where: { id: input.statusId },
        });
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});
