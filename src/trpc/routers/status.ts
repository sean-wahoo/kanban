import { authProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { eq } from "drizzle-orm";
import { statuses } from "@/server/db";

export const statusRouter = createTRPCRouter({
  getStatus: baseProcedure
    .input(
      z.object({
        statusId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [status] = await ctx.db
        .select()
        .from(statuses)
        .where(eq(statuses.id, input.statusId))
        .limit(1);
      if (!status) {
        throw new Error("status not found");
      }
      return status;
    }),
  getStatuses: baseProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(statuses);
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
      const updatePromises = [];
      for (const status of input.statuses) {
        updatePromises.push(
          ctx.db
            .update(statuses)
            .set({ order: status.newOrder })
            .where(eq(statuses.id, status.id)),
        );
      }

      return await Promise.all(updatePromises);
    }),
  deleteStatus: authProcedure
    .input(
      z.object({
        statusId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(statuses).where(eq(statuses.id, input.statusId));
    }),
});
