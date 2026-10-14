import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { projects } from "@/server/db";

export const projectsRouter = createTRPCRouter({
  getProjects: baseProcedure.query(async ({ ctx }) => {
    const allProjects = await ctx.db.select().from(projects);
    return allProjects;
  }),
});
