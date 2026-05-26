import { prefetch, HydrateClient, trpc } from "@/trpc/server";
import Kanban from "./_components/kanban";
import styles from "./styles.module.scss";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function Home() {
  prefetch(trpc.tasks.getTasks.queryOptions());
  prefetch(trpc.projects.getProjects.queryOptions());
  prefetch(trpc.status.getStatuses.queryOptions());
  return (
    <HydrateClient>
      <Suspense fallback={<p>loading...</p>}>
        <main className={styles.main}>
          <Kanban />
        </main>
      </Suspense>
    </HydrateClient>
  );
}
