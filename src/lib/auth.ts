import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor, username } from "better-auth/plugins";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/env.mjs";
import { getBaseURL } from "./utils/shared";

process.env.BETTER_AUTH_URL = getBaseURL();
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies(), username(), twoFactor()],
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  trustedOrigins: [`${env.BASE_URL}`, `http://localhost:${env.PORT}`],
});
