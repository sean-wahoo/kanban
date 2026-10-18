import { env } from "@/env.mjs";

export const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return process.env.NODE_ENV === "production"
      ? (env.NEXT_PUBLIC_BASE_URL ?? `https://${env.NEXT_PUBLIC_VERCEL_URL}`)
      : `http://localhost:${env.NEXT_PUBLIC_PORT}`;
  }
  return process.env.NODE_ENV === "production"
    ? (env.BASE_URL ?? `https://${env.VERCEL_URL}`)
    : `http://localhost:${env.PORT}/`;
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

export const timeAgo = (date: Date, now: Date = new Date()): string => {
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  );

  if (seconds < 60) {
    return "just now";
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks}w ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }
  return `${Math.floor(days / 365)}y ago`;
};
