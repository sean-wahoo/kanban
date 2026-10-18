"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import styles from "../styles.module.scss";
import { c } from "@/lib/utils/client";
import { timeAgo } from "@/lib/utils/shared";
import { Avatar, Toolbar } from "@base-ui/react";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { SortIcon, TooltipTd, type SortDir } from "./shared";

type SortKey = "title" | "taskCount" | "creator" | "lastEdited";

const defaultSortDir = (key: SortKey): SortDir =>
  key === "taskCount" || key === "lastEdited" ? "desc" : "asc";

const ProjectsTable = () => {
  const trpc = useTRPC();
  const { data: projects } = useSuspenseQuery(
    trpc.projects.getProjectsOverview.queryOptions(),
  );

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "lastEdited",
    dir: "desc",
  });

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: defaultSortDir(key) },
    );
  };

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? projects.filter((project) =>
          [project.title, project.description, project.creator]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(query)),
        )
      : projects;

    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "taskCount":
          return (a.taskCount - b.taskCount) * factor;
        case "lastEdited":
          return (a.lastEdited.getTime() - b.lastEdited.getTime()) * factor;
        case "creator":
          return (a.creator ?? "").localeCompare(b.creator ?? "") * factor;
        default:
          return a.title.localeCompare(b.title) * factor;
      }
    });
  }, [projects, search, sort]);

  const sortableTh = (key: SortKey, label: string) => (
    <th
      className={c(styles.sortable, sort.key === key ? styles.active : null)}
      onClick={() => toggleSort(key)}
      aria-sort={
        sort.key === key
          ? sort.dir === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <span className={styles.th_contents}>
        {label}
        <SortIcon active={sort.key === key} dir={sort.dir} />
      </span>
    </th>
  );

  const titleSpan = (title: string, id: string) => (
    <span className={styles.project_title}>
      <Link href={`/projects/${id}`} className={styles.project_link}>
        {title}
      </Link>
    </span>
  );

  return (
    <>
      <Toolbar.Root className={styles.toolbar}>
        <h1 className={styles.heading}>projects</h1>
        <div className={styles.search}>
          <SearchIcon size={14} />
          <Toolbar.Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search projects"
            aria-label="search projects"
          />
        </div>
      </Toolbar.Root>

      {projects.length === 0 ? (
        <p className={styles.empty}>no projects yet</p>
      ) : (
        <div className={styles.table_wrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {sortableTh("title", "project")}
                {sortableTh("taskCount", "tasks")}
                {sortableTh("creator", "creator")}
                {sortableTh("lastEdited", "last edited")}
              </tr>
            </thead>
            <tbody>
              {rows.map((project) => (
                <tr key={project.id}>
                  {project.description ? (
                    <TooltipTd
                      className={styles.project_cell}
                      label={project.description}
                    >
                      {titleSpan(project.title, project.id)}
                      <span className={styles.project_description}>
                        {project.description}
                      </span>
                    </TooltipTd>
                  ) : (
                    <td className={styles.project_cell}>
                      {titleSpan(project.title, project.id)}
                    </td>
                  )}
                  <td className={styles.tasks_cell}>{project.taskCount}</td>
                  <td className={styles.lead_cell}>
                    <span className={styles.lead_contents}>
                      <Avatar.Root className={styles.avatar}>
                        <Avatar.Fallback>
                          {(project.creator ?? "?").charAt(0).toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <span className={styles.lead_name}>
                        {project.creator ?? "unknown"}
                      </span>
                    </span>
                  </td>
                  <TooltipTd
                    className={styles.time_cell}
                    label={project.lastEdited.toLocaleString()}
                  >
                    {timeAgo(project.lastEdited)}
                  </TooltipTd>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.no_matches}>
                    no projects match &quot;{search}&quot;
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default ProjectsTable;
