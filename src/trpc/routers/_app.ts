import { z } from "zod";
import { authProcedure, baseProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { projectsRouter } from "./projects";
import { tasksRouter } from "./tasks";
import { statusRouter } from "./status";
export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  tasks: tasksRouter,
  status: statusRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
