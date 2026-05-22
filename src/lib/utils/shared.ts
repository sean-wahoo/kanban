import { env } from "@/env.mjs";

export const getBaseURL = () => {
  const isServer = typeof window === "undefined";
  if (isServer) {
    return env.NODE_ENV === "production"
      ? env.BASE_URL
      : `http://localhost:${env.PORT}`;
  } else {
    return env.NEXT_PUBLIC_NODE_ENV === "production"
      ? env.NEXT_PUBLIC_BASE_URL
      : `http://localhost:${env.NEXT_PUBLIC_PORT}`;
  }
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
