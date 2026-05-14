import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const projectsRouter = createTRPCRouter({
  getProjects: baseProcedure.query(async ({ ctx }) => {
    try {
      const projects = await ctx.prisma.project.findMany();
      return projects;
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),
});
