import { env } from "@/env.mjs";

export const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return env.NEXT_PUBLIC_NODE_ENV === "production"
      ? (env.NEXT_PUBLIC_BASE_URL ?? env.NEXT_PUBLIC_VERCEL_URL)
      : `http://localhost:${env.NEXT_PUBLIC_PORT}`;
  }
  return env.NODE_ENV === "production"
    ? (env.BASE_URL ?? env.VERCEL_URL)
    : `http://localhost:${env.PORT}`;
};

export enum Colors {
  white = "#e4e2d9",
  black = "#0e1011",
  green = "#169873",
  red = "#df2935",
  blue = "#3a7ca5",
  purple = "#816e94",
  orange = "#ed7f27",
}
