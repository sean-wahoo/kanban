import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    TURSO_DATABASE_URL: z.string(),
    TURSO_DATABASE_TOKEN: z.string(),
    BETTER_AUTH_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    ADMIN_EMAIL: z.string(),
    ADMIN_PASSWORD: z.string(),
    IP_ALLOWLIST: z.string().transform((arg) => arg.split(",")),
    BASE_URL: z.optional(z.string()),
    NODE_ENV: z.enum(["test", "development", "production"]),
    PORT: z.string().refine((s) => !isNaN(Number(s)) && isFinite(Number(s))),
    VERCEL_URL: z.optional(z.string()),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z.enum(["test", "development", "production"]),
    NEXT_PUBLIC_PORT: z
      .string()
      .refine((s) => !isNaN(Number(s)) && isFinite(Number(s))),
    NEXT_PUBLIC_BASE_URL: z.optional(z.string()),
    NEXT_PUBLIC_VERCEL_URL: z.optional(z.string()),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,

    BASE_URL: process.env.BASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,

    PORT: process.env.PORT,
    NEXT_PUBLIC_PORT: process.env.NEXT_PUBLIC_PORT,

    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,

    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_DATABASE_TOKEN: process.env.TURSO_DATABASE_TOKEN,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    IP_ALLOWLIST: process.env.IP_ALLOWLIST,
  },
  emptyStringsAsUndefined: true,
});

/**
 *
 * @typedef {typeof env} EnvType
 *
 * @typedef {keyof EnvType} EnvName
 *
 * */
