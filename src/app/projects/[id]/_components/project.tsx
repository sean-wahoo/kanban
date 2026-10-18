"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import listStyles from "../../styles.module.scss";
import styles from "../styles.module.scss";
import { c } from "@/lib/utils/client";
import { timeAgo } from "@/lib/utils/shared";
import { Avatar } from "@base-ui/react";
import Link from "next/link";
import { SortIcon, TooltipTd, type SortDir } from "../../_components/shared";

type SortKey = "title" | "statusName" | "creator" | "lastEdited";

const defaultSortDir = (key: SortKey): SortDir =>
  key === "lastEdited" ? "desc" : "asc";

const ProjectView = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getProjectOverview.queryOptions({ projectId }),
  );

  const { title, description, createdAt, updatedAt, creator, tasks, statuses } =
    project;

  const lastEdited = useMemo(
    () =>
      tasks.reduce(
        (acc, task) => (task.updatedAt > acc ? task.updatedAt : acc),
        updatedAt,
      ),
    [tasks, updatedAt],
  );

  const breakdown = useMemo(
    () =>
      [...statuses]
        .sort((a, b) => a.order - b.order)
        .map((status) => ({
          ...status,
          count: tasks.filter((task) => task.statusId === status.id).length,
        })),
    [statuses, tasks],
  );

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
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...tasks].sort((a, b) => {
      switch (sort.key) {
        case "statusName":
          return (a.statusName ?? "").localeCompare(b.statusName ?? "") * factor;
        case "creator":
          return (a.creator ?? "").localeCompare(b.creator ?? "") * factor;
        case "lastEdited":
          return (a.updatedAt.getTime() - b.updatedAt.getTime()) * factor;
        default:
          return a.title.localeCompare(b.title) * factor;
      }
    });
  }, [tasks, sort]);

  const sortableTh = (key: SortKey, label: string) => (
    <th
      className={c(
        listStyles.sortable,
        sort.key === key ? listStyles.active : null,
      )}
      onClick={() => toggleSort(key)}
      aria-sort={
        sort.key === key
          ? sort.dir === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <span className={listStyles.th_contents}>
        {label}
        <SortIcon active={sort.key === key} dir={sort.dir} />
      </span>
    </th>
  );

  return (
    <>
      <Link href="/projects" className={styles.back}>
        ← projects
      </Link>
      <div className={listStyles.toolbar}>
        <h1 className={listStyles.heading}>{title}</h1>
        <span className={listStyles.lead_contents}>
          <Avatar.Root className={listStyles.avatar}>
            <Avatar.Fallback>
              {(creator ?? "?").charAt(0).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
          <span className={listStyles.lead_name}>
            {creator ?? "unknown"}
          </span>
        </span>
      </div>

      <div className={styles.details}>
        <p className={styles.description}>{description ?? "no description"}</p>
        <dl className={styles.info_grid}>
          <div className={styles.info_item}>
            <dt>created</dt>
            <dd>{createdAt.toLocaleString()}</dd>
          </div>
          <div className={styles.info_item}>
            <dt>last edited</dt>
            <dd>{timeAgo(lastEdited)}</dd>
          </div>
          <div className={styles.info_item}>
            <dt>tasks</dt>
            <dd>{tasks.length}</dd>
          </div>
        </dl>
        <div className={styles.chips}>
          {breakdown.map((status) => (
            <span key={status.id} className={styles.chip}>
              <span
                className={styles.status_dot}
                style={{
                  ["--status-color" as string]: status.color ?? undefined,
                }}
              />
              {status.name} · {status.count}
            </span>
          ))}
        </div>
      </div>

      <h2 className={styles.tasks_heading}>tasks</h2>
      {tasks.length === 0 ? (
        <p className={listStyles.empty}>no tasks in this project yet</p>
      ) : (
        <div className={listStyles.table_wrap}>
          <table className={listStyles.table}>
            <thead>
              <tr>
                {sortableTh("title", "task")}
                {sortableTh("statusName", "status")}
                {sortableTh("creator", "creator")}
                {sortableTh("lastEdited", "last edited")}
              </tr>
            </thead>
            <tbody>
              {rows.map((task) => (
                <tr key={task.id}>
                  {task.description ? (
                    <TooltipTd
                      className={listStyles.project_cell}
                      label={task.description}
                    >
                      <span className={listStyles.project_title}>
                        {task.title}
                      </span>
                      <span className={listStyles.project_description}>
                        {task.description}
                      </span>
                    </TooltipTd>
                  ) : (
                    <td className={listStyles.project_cell}>
                      <span className={listStyles.project_title}>
                        {task.title}
                      </span>
                    </td>
                  )}
                  <td className={styles.status_cell}>
                    <span className={listStyles.lead_contents}>
                      <span
                        className={styles.status_dot}
                        style={{
                          ["--status-color" as string]:
                            task.statusColor ?? undefined,
                        }}
                      />
                      <span className={listStyles.lead_name}>
                        {task.statusName ?? "no status"}
                      </span>
                    </span>
                  </td>
                  <td className={listStyles.lead_cell}>
                    <span className={listStyles.lead_contents}>
                      <Avatar.Root className={listStyles.avatar}>
                        <Avatar.Fallback>
                          {(task.creator ?? "?").charAt(0).toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <span className={listStyles.lead_name}>
                        {task.creator ?? "unknown"}
                      </span>
                    </span>
                  </td>
                  <TooltipTd
                    className={listStyles.time_cell}
                    label={task.updatedAt.toLocaleString()}
                  >
                    {timeAgo(task.updatedAt)}
                  </TooltipTd>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default ProjectView;
