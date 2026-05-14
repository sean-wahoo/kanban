import { prefetch, trpc } from "@/trpc/server";
import Image from "next/image";
import Kanban from "./_components/kanban";

export default function Home() {
  prefetch(trpc.tasks.getTasks.queryOptions());
  prefetch(trpc.projects.getProjects.queryOptions());
  prefetch(trpc.status.getStatuses.queryOptions());
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Kanban />
    </div>
  );
}
