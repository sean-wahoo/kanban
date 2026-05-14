import { authMiddleware } from "@/trpc/init";
import { initTRPC } from "@trpc/server";
import { experimental_nextAppDirCaller } from "@trpc/server/adapters/next-app-dir";
interface Meta {
  span: string;
}
export const t = initTRPC.meta<Meta>().create();
export const serverActionProcedure = t.procedure
  .experimental_caller(
    experimental_nextAppDirCaller({
      pathExtractor: ({ meta }) => (meta as Meta)?.span ?? "",
    }),
  )
  .use(authMiddleware);
