import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor, username } from "better-auth/plugins";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/env.mjs";
import { getBaseURL } from "./utils/shared";

const baseUrl = getBaseURL();
process.env.BETTER_AUTH_URL = baseUrl?.startsWith("http")
  ? baseUrl
  : `https://${baseUrl}`;
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), twoFactor(), nextCookies()],
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  trustedOrigins: [`${getBaseURL()}`, `http://localhost:${env.PORT}`],
});
