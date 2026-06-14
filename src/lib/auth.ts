import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor, username } from "better-auth/plugins";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { getBaseURL } from "./utils/shared";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), twoFactor(), nextCookies()],
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  trustedOrigins: [`${getBaseURL()}`, "*.vercel.app"],
  advancesd: {
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "production" ? getBaseURL() : undefined,
    },
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      secure: true,
      httpOnly: true,
    },
  },
});
