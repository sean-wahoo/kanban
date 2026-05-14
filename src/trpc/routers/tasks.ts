import { TRPCError } from "@trpc/server";
import { authProcedure, baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { Prisma } from "../../../generated/prisma/client";

export const tasksRouter = createTRPCRouter({
  getTask: baseProcedure
    .input(
      z.object({
        taskId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const task = await ctx.prisma.task.findFirst({
          where: {
            id: input.taskId,
          },
          include: {
            status: true,
          },
        });
        if (!task) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }
        return task;
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: e,
        });
      }
    }),
  getTasks: baseProcedure
    .input(z.optional(z.object({ statusIds: z.optional(z.array(z.string())) })))
    // .input(z.optional(z.infer<Prisma.TaskWhereInput>))
    .query(async ({ ctx, input }) => {
      try {
        const queryOpts: Prisma.TaskFindManyArgs = {
          // include: {
          //   status: true,
          // },
        };
        if (input?.statusIds) {
          queryOpts.where = {
            ...queryOpts.where,
            statusId: {
              in: input.statusIds,
            },
          };
        }
        const tasks = await ctx.prisma.task.findMany(queryOpts);
        return tasks;
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  updateTaskStatus: authProcedure
    .input(
      z.object({
        taskId: z.string(),
        newStatusId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.task.update({
          where: {
            id: input.taskId,
            statusId: {
              not: input.newStatusId,
            },
          },
          data: {
            statusId: input.newStatusId,
          },
        });
      } catch (e) {
        console.error(e);
      }
    }),
});
