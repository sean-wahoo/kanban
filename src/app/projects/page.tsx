import { prefetch, HydrateClient, trpc } from "@/trpc/server";
import ProjectsTable from "./_components/table";
import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "projects",
};

export default function ProjectsPage() {
  prefetch(trpc.projects.getProjectsOverview.queryOptions());
  return (
    <HydrateClient>
      <main className={styles.main}>
        <div className={styles.container}>
          <ProjectsTable />
        </div>
      </main>
    </HydrateClient>
  );
}
