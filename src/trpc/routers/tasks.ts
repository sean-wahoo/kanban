import { TRPCError } from "@trpc/server";
import { authProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { tasks } from "@/server/db";

export const tasksRouter = createTRPCRouter({
  getTask: baseProcedure
    .input(
      z.object({
        taskId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [task] = await ctx.db
        .select()
        .from(tasks)
        .where(eq(tasks.id, input.taskId))
        .limit(1);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      return task;
    }),
  getTasks: baseProcedure
    .input(z.optional(z.object({ statusIds: z.optional(z.array(z.string())) })))
    .query(async ({ ctx, input }) => {
      if (input?.statusIds?.length) {
        return ctx.db
          .select()
          .from(tasks)
          .where(inArray(tasks.statusId, input.statusIds));
      }
      return ctx.db.select().from(tasks);
    }),
  updateTaskStatus: authProcedure
    .input(
      z.object({
        taskId: z.string(),
        newStatusId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(tasks)
        .set({ statusId: input.newStatusId })
        .where(eq(tasks.id, input.taskId));
    }),
  deleteTask: authProcedure
    .input(
      z.object({
        taskId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(tasks).where(eq(tasks.id, input.taskId));
    }),
});
