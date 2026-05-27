"use client";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchStreamLink,
  loggerLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";
import superjson from "superjson";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { env } from "@/env.mjs";
export const { useTRPCClient, TRPCProvider, useTRPC } =
  createTRPCContext<AppRouter>();
let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
function getUrl() {
  if (typeof window !== "undefined") {
    return "/kanban/api/trpc";
  }

  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}/kanban/api/trpc`;
  return `http://localhost:${env.PORT}/kanban/api/trpc`; // })();
}
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (opts) =>
            // Log in development, or if it's a server-side execution error
            {
              if (
                (typeof window === "undefined" &&
                  env.NODE_ENV === "development") ||
                (typeof window !== "undefined" &&
                  window.location.hostname === "localhost") ||
                (opts.direction === "down" &&
                  opts.result instanceof Error &&
                  opts.direction === "down" &&
                  "error" in opts &&
                  opts.error instanceof Error)
              ) {
                return true;
              }
              return false;
            },
        }),
        httpBatchStreamLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
