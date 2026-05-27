import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIPAuth } from "@/lib/utils/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import superjson from "superjson";
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const headersObj = await headers();
  const ip = headersObj.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const session = await auth.api.getSession({ headers: headersObj });

  return { prisma, sessionData: session, ip, ...opts };
};

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
  });
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const authMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!getIPAuth()) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "ip not allowed",
    });
  }

  if (!ctx.sessionData) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "not logged in",
    });
  }

  return next({
    ctx: {
      ...ctx,
    },
  });
});

export const authProcedure = baseProcedure.use(authMiddleware);
