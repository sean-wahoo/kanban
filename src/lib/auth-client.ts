import { getBaseURL } from "@/lib/utils/shared";
import { twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [usernameClient(), twoFactorClient()],
});
