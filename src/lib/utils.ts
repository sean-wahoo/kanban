import { env } from "@/env.mjs";
import { getIPAuth } from "@/lib/utils/server";
import { useEffect, useState } from "react";

export const getBaseURL = () => {
  let url = env.NEXT_PUBLIC_BASE_URL ?? "http://localhost" + `:${env.PORT}`;
  return url;
};

export const c = (...args: (string | null | undefined)[]) => {
  return Array.from(args.filter((a) => !!a)).join(" ");
};
interface RectBoundaries {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const clickInRect = (
  x: number,
  y: number,
  rect: RectBoundaries,
): boolean => {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
};

export const useIPAuth = () => {
  const [ipValid, setIPValid] = useState(false);

  useEffect(() => {
    getIPAuth()
      .then((valid) => setIPValid(valid))
      .catch((e) => {
        setIPValid(false);
        console.log(`useIPAuth error: ${e}`);
      });
  }, []);
  return ipValid;
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
