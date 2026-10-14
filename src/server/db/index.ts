import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/env.mjs";
import * as schema from "./schema";

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_DATABASE_TOKEN,
});

export const db = drizzle({ client, schema });

// const globalForDb = globalThis as unknown as {
//   db: ReturnType<typeof createDb>;
// };
//
// function createDb() {
//   return drizzle(client, { schema });
// }
//
// export const db = globalForDb.db ?? createDb();
//
// if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export * from "./schema";
