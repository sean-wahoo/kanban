import { prefetch, trpc } from "@/trpc/server";
import Kanban from "./_components/kanban";
import styles from "./styles.module.scss";

export default function Home() {
  prefetch(trpc.tasks.getTasks.queryOptions());
  prefetch(trpc.projects.getProjects.queryOptions());
  prefetch(trpc.status.getStatuses.queryOptions());
  return (
    <main className={styles.main}>
      <Kanban />
    </main>
  );
}
