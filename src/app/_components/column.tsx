"use client";

import { RouterOutput, useTRPC } from "@/trpc/client";
import { PencilIcon, XIcon } from "lucide-react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ComponentProps, useId, useRef } from "react";
import styles from "./styles.module.scss";
import { useSortable } from "@dnd-kit/react/sortable";
import { authClient } from "@/lib/auth-client";
import { useMounted } from "@/lib/hooks";
import Task, { TaskLoading } from "./task";
import { Colors } from "@/lib/utils/shared";
import { c } from "@/lib/utils/client";

interface StatusColumnProps extends ComponentProps<"div"> {
  index: number;
  status: RouterOutput["status"]["getStatus"];
  loading?: boolean;
}
const StatusColumn = ({
  index,
  status,
  loading = false,
  children,
  ...props
}: StatusColumnProps) => {
  const { data: sessionData } = authClient.useSession();
  const updateStatusDialogRef = useRef<HTMLDialogElement>(null);
  const trpc = useTRPC();
  const statusKey = trpc.status.getStatus.queryKey({
    statusId: status.id,
  });
  const statusesKey = trpc.status.getStatuses.queryKey();

  const queryClient = useQueryClient();
  const { data: tasks, status: tasksStatus } = useSuspenseQuery(
    trpc.tasks.getTasks.queryOptions(),
  );

  const isUserStatus = status.userId === sessionData?.user.id;
  const { ref: columnSlotRef } = useSortable({
    id: `column_${status.id}`,
    index,
    disabled: !isUserStatus || updateStatusDialogRef.current?.open,
    data: {
      type: "COLUMN",
      statusId: status.id,
    },
  });

  const deleteStatusMutation = useMutation(
    trpc.status.deleteStatus.mutationOptions({
      onSettled: async () => {
        queryClient.invalidateQueries({ queryKey: statusKey });
        queryClient.invalidateQueries({ queryKey: statusesKey });
      },
    }),
  );

  const mounted = useMounted();

  return (
    <div
      {...props}
      id={`status_column_${status.id}`}
      className={styles.status_column}
      ref={columnSlotRef}
      style={{
        ...(props.style ?? {}),
        ["--status-color" as string]: status?.color,
      }}
    >
      {mounted && isUserStatus ? (
        <div className={styles.buttons}>
          <button
            className={styles.edit}
            onClick={() => {
              // openModal("EDIT_STATUS", { statusId: status.id });
            }}
          >
            <PencilIcon />
          </button>
          <button
            className={styles.delete}
            onClick={() => {
              deleteStatusMutation.mutateAsync({
                statusId: status.id,
              });
            }}
          >
            <XIcon />
          </button>
        </div>
      ) : null}
      <header style={{ borderColor: status?.color! }}>{status?.name}</header>
      <main>
        {tasksStatus === "success"
          ? tasks
              .filter((task) => task.statusId === status.id)
              .map((task, i) => (
                <Task
                  color={status?.color as Colors}
                  task={task}
                  taskId={task.id}
                  index={i}
                  key={task.id}
                />
              ))
          : Array.from({ length: 3 }).map((_, i) => (
              <TaskLoading key={`task_loading_${i}`} />
            ))}
      </main>
    </div>
  );
};

export const ColumnLoading = () => {
  const id = useId();
  return (
    <div className={styles.status_column}>
      <header>
        <div className={c(styles.shimmer, styles.text_line)} />
      </header>
      <main>
        {Array({ length: 3 }).map((_, i) => (
          <TaskLoading key={`task_loading_${id}_${i}`} />
        ))}
      </main>
    </div>
  );
};

export default StatusColumn;
