"use server";
import { headers } from "next/headers";
import { env } from "@/env.mjs";
import { auth } from "../auth";

export async function getIPAuth() {
  if (env.NODE_ENV === "development") {
    return true;
  }

  const headersObj = await headers();
  const ip =
    headersObj.get("x-real-ip") ??
    headersObj.get("x-forwarded-for")?.split(",")[0];
  if (!ip) return false;

  const allowList = env.IP_ALLOWLIST;
  const localLoopbacks = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];

  const cleanIP = ip.startsWith("::ffff:") ? ip.substring(7) : ip;

  if (localLoopbacks.includes(cleanIP)) {
    return false;
  }

  return allowList.includes(cleanIP);
}

export async function assertAuth() {
  const headersObj = await headers();
  const session = await auth.api.getSession({
    headers: headersObj,
  });
  if (!session) throw new Error("Unauthorized");
  return session;
}
