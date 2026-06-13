import { env } from "@/env.mjs";
import { getBaseURL, getRootURL } from "@/lib/utils/shared";
import { twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  basePath: "/api/auth",
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [usernameClient(), twoFactorClient()],
});
