import { env } from "@/env.mjs";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = `${env.DATABASE_URL}`;
const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
  }).$extends({
    // query: {
    //   task: {
    //     async create({ args, query }) {
    //       if (!args.data.statusId) {
    //       }
    //     },
    //   },
    // },
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV === "production") globalForPrisma.prisma = prisma;
