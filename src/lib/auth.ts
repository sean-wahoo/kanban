import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor, username } from "better-auth/plugins";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/env.mjs";
import { getBaseURL, getRootURL } from "./utils/shared";

// const baseUrl = getBaseURL().replace("3010", "3005");
// process.env.BETTER_AUTH_URL = baseUrl?.startsWith("http")
//   ? baseUrl
//   : `https://${baseUrl}`;
const trustedOrigins = [];
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), twoFactor(), nextCookies()],
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  trustedOrigins: [
    `${getBaseURL().replace("/kanban", "")}`,
    `${getRootURL()}`,
    `http://localhost:${env.PORT ?? 3010}`,
    `http://localhost:3005`,
    "*.vercel.app",
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: env.NODE_ENV === "production" ? getBaseURL() : undefined,
    },
    defaultCookieAttributes: {
      sameSite: env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
      httpOnly: true,
    },
  },
});
