import { prefetch, HydrateClient, trpc, caller } from "@/trpc/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectView from "./_components/project";
import listStyles from "../styles.module.scss";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const project = await caller.projects.getProjectOverview({
      projectId: id,
    });
    return { title: project.title };
  } catch {
    return { title: "project" };
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  try {
    await caller.projects.getProjectOverview({ projectId: id });
  } catch {
    notFound();
  }

  prefetch(trpc.projects.getProjectOverview.queryOptions({ projectId: id }));

  return (
    <HydrateClient>
      <main className={listStyles.main}>
        <div className={listStyles.container}>
          <ProjectView projectId={id} />
        </div>
      </main>
    </HydrateClient>
  );
}
