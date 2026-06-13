import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { getRootURL } from "./lib/utils/shared";

const setCorsHeaders = async (req: NextRequest) => {
  const origin = req.headers.get("origin");

  const allowedOrigins = [
    getRootURL(),
    "https://seanline.dev",
    "https://www.seanline.dev",
    "http://localhost:3005",
    "http://localhost:3010",
  ];

  const isAllowedOrigin =
    origin &&
    (allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.startsWith("http://localhost"));

  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });

    if (isAllowedOrigin && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,OPTIONS,PUT,DELETE,PATCH",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-TRPC-Source, X-Client-Date, TRPC-Accept",
    );

    return response;
  }

  const response = NextResponse.next();

  if (isAllowedOrigin && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
};

const checkAuth = async (req: NextRequest) => {
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    "";
  const session = await auth.api.getSession({ headers: req.headers });
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!env.IP_ALLOWLIST.includes(ip)) {
      return new NextResponse(null, {
        status: 403,
        statusText: "ip not allowed",
      });
    }
    if (!session?.user) {
      return new NextResponse(null, {
        status: 403,
        statusText: "not logged in",
      });
    }
  }
};

export async function proxy(req: NextRequest) {
  const corsResponse = await setCorsHeaders(req);
  if (corsResponse) return corsResponse;
  const authResponse = await checkAuth(req);
  if (authResponse) return authResponse;

  const finalResponse = NextResponse.next();
  const origin = req.headers.get("origin");
  if (origin && origin.endsWith(".vercel.app")) {
    finalResponse.headers.set("Access-Control-Allow-Origin", origin);
    finalResponse.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return finalResponse;
}

export const config = {
  matcher: ["/api/trpc/:path*", "/api/auth/:path*"],
};
