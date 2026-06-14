import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });
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
  const res = await handler(req);

  setCorsHeaders(res, origin);
  return res;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const res = await handler(req);
  setCorsHeaders(res, origin);
  return res;
}
