import { env } from "@/env.mjs";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter =
  env.NODE_ENV !== "production"
    ? new PrismaBetterSqlite3({ url: "file:./dev.db" })
    : new PrismaLibSql({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_DATABASE_TOKEN,
      });

const createPrismaClient = () =>
  new PrismaClient({
    adapter,
  });
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV === "production") globalForPrisma.prisma = prisma;
