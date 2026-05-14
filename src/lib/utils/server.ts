"use server";
import { headers } from "next/headers";
import { env } from "@/env.mjs";
import { auth } from "../auth";

export async function getIPAuth() {
  const headersObj = await headers();
  const ip =
    headersObj.get("x-real-ip") ??
    headersObj.get("x-forwarded-for")?.split(",")[0];
  const allowList = env.NODE_ENV === "development" ? ["::1"] : env.IP_ALLOWLIST;
  if (!ip || !allowList.includes(ip!)) {
    return false;
  }
  return true;
}

export async function assertAuth(userId?: string) {
  const headersObj = await headers();
  // if (!(await assertIPAuth(headersObj))) {
  //   throw new Error("Unauthorized");
  // }
  const session = await auth.api.getSession({
    headers: headersObj,
  });
  if (!session) throw new Error("Unauthorized");
  // if (userId !== session.user.id) throw new Error("Unauthorized");
  return session;
}
