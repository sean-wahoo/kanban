import { env } from "@/env.mjs";

export const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // return "/kanban";
    return env.NEXT_PUBLIC_NODE_ENV === "production"
      ? (env.NEXT_PUBLIC_BASE_URL ?? `https://${env.NEXT_PUBLIC_VERCEL_URL}`) +
          "/kanban"
      : `http://localhost:${env.NEXT_PUBLIC_PORT}/kanban`;
  }
  return env.NODE_ENV === "production"
    ? (env.BASE_URL ?? `https://${env.VERCEL_URL}`) + "/kanban"
    : `http://localhost:${env.PORT}/kanban`;
};

export const getRootURL = () => {
  if (typeof window !== "undefined") {
    return env.NEXT_PUBLIC_NODE_ENV === "production"
      ? env.NEXT_PUBLIC_ROOT_URL
      : `http://localhost:${env.NEXT_PUBLIC_ROOT_PORT}`;
  }
  return env.NODE_ENV === "production"
    ? env.ROOT_URL
    : `http://localhost:${env.ROOT_PORT}`;
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
