import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { desc, eq, sql } from "drizzle-orm";
import { projects, statuses, tasks, user } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const lastEditedExpr = sql`max(coalesce(${tasks.updatedAt}, ${projects.updatedAt}))`;

export const projectsRouter = createTRPCRouter({
  getProjects: baseProcedure.query(async ({ ctx }) => {
    const allProjects = await ctx.db.select().from(projects);
    return allProjects;
  }),
  getProjectsOverview: baseProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        creator: user.name,
        taskCount: sql<number>`count(${tasks.id})`.mapWith(Number),
        lastEdited: sql<Date>`max(coalesce(${tasks.updatedAt}, ${projects.updatedAt}))`.mapWith(
          projects.updatedAt,
        ),
      })
      .from(projects)
      .leftJoin(tasks, eq(tasks.projectId, projects.id))
      .leftJoin(user, eq(user.id, projects.userId))
      .groupBy(projects.id)
      .orderBy(desc(lastEditedExpr));
  }),
  getProjectOverview: baseProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [project] = await ctx.db
        .select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          creator: user.name,
        })
        .from(projects)
        .leftJoin(user, eq(user.id, projects.userId))
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const projectTasks = await ctx.db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          statusId: tasks.statusId,
          statusName: statuses.name,
          statusColor: statuses.color,
          creator: user.name,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
        })
        .from(tasks)
        .leftJoin(statuses, eq(statuses.id, tasks.statusId))
        .leftJoin(user, eq(user.id, tasks.userId))
        .where(eq(tasks.projectId, input.projectId));

      const allStatuses = await ctx.db
        .select({
          id: statuses.id,
          name: statuses.name,
          color: statuses.color,
          order: statuses.order,
        })
        .from(statuses);

      return { ...project, tasks: projectTasks, statuses: allStatuses };
    }),
});
