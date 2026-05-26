import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

const { POST: authPost, GET: authGet } = toNextJsHandler(auth);

const setCorsHeaders = (res: Response, origin: string | null) => {
  const allowedOrigins = [
    "http://localhost:3010",
    "http://localhost:3005",
    "https://seanline.dev",
  ];

  if (
    origin &&
    (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))
  ) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PATCH, DELETE",
  );
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
};

export async function OPTIONS(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const res = new Response(null, { status: 204 });
  setCorsHeaders(res, origin);
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const res = await authGet(req);

  setCorsHeaders(res, origin);
  return res;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const res = await authPost(req);
  setCorsHeaders(res, origin);
  return res;
}
