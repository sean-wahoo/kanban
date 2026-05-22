import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.literal(["development", "production"]),
    BASE_URL: z.string(),
    DATABASE_URL: z.string(),
    BETTER_AUTH_URL: z.string().min(32),
    BETTER_AUTH_SECRET: z.string().min(32),
    ADMIN_EMAIL: z.string(),
    ADMIN_PASSWORD: z.string(),
    PORT: z.string().refine((s) => !isNaN(Number(s)) && isFinite(Number(s))),
    IP_ALLOWLIST: z.string().transform((arg) => arg.split(",")),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z.literal(["development", "production"]),
    NEXT_PUBLIC_PORT: z
      .string()
      .refine((s) => !isNaN(Number(s)) && isFinite(Number(s))),
    NEXT_PUBLIC_BASE_URL: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,

    BASE_URL: process.env.BASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,

    PORT: process.env.PORT,
    NEXT_PUBLIC_PORT: process.env.NEXT_PUBLIC_PORT,

    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    IP_ALLOWLIST: process.env.IP_ALLOWLIST,
  },
});

/**
 *
 * @typedef {typeof env} EnvType
 *
 * @typedef {keyof EnvType} EnvName
 *
 * */
