import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { twoFactor, username } from "better-auth/plugins";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { nextCookies } from "better-auth/next-js";
import { getBaseURL } from "./utils/shared";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), twoFactor(), nextCookies()],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  trustedOrigins: [`${getBaseURL()}`, "*.vercel.app"],
});
