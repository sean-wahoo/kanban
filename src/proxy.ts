import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
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
  return NextResponse.next();
}
