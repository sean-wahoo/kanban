"use client";

import { useTRPC } from "@/trpc/client";
import { PencilIcon, XIcon } from "lucide-react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ComponentProps, useRef } from "react";
import styles from "./styles.module.scss";
import { useSortable } from "@dnd-kit/react/sortable";
import { useDialogs } from "@/components/dialog";
import { authClient } from "@/lib/auth-client";
import { useMounted } from "@/lib/hooks";
import Task from "./task";
import type { Task as TaskType } from "../../../generated/prisma/client";
import { Colors } from "@/lib/utils/shared";

interface StatusColumnProps extends ComponentProps<"div"> {
  statusId: string;
  index: number;
  tasks: TaskType[];
}
const StatusColumn = ({
  statusId,
  index,
  children,
  tasks,
  ...props
}: StatusColumnProps) => {
  const { data: sessionData } = authClient.useSession();
  const updateStatusDialogRef = useRef<HTMLDialogElement>(null);
  const trpc = useTRPC();
  const statusKey = trpc.status.getStatus.queryKey({
    statusId,
  });
  const statusesKey = trpc.status.getStatuses.queryKey();

  const queryClient = useQueryClient();
  const { data: status } = useSuspenseQuery(
    trpc.status.getStatus.queryOptions(
      { statusId },
      {
        placeholderData: () => {
          const cachedStatuses = queryClient.getQueryData(statusesKey);
          const found = cachedStatuses?.find((c) => c.id === statusId);
          if (found) return { ...found, tasks: [] };
        },
      },
    ),
  );

  const isUserStatus = status.userId === sessionData?.user.id;
  const { ref: columnSlotRef } = useSortable({
    id: `column_${statusId}`,
    index,
    disabled: !isUserStatus || updateStatusDialogRef.current?.open,
    data: {
      type: "COLUMN",
      statusId,
    },
  });

  const { openModal } = useDialogs();

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
      id={`status_column_${statusId}`}
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
              openModal("EDIT_STATUS", { statusId: statusId });
            }}
          >
            <PencilIcon />
          </button>
          <button
            className={styles.delete}
            onClick={() => {
              deleteStatusMutation.mutateAsync({
                statusId: statusId,
              });
            }}
          >
            <XIcon />
          </button>
        </div>
      ) : null}
      <header style={{ borderColor: status?.color! }}>{status?.name}</header>
      <main>
        {tasks?.map((task, i) => (
          <Task
            color={status?.color as Colors}
            task={task}
            taskId={task.id}
            index={i}
            key={task.id}
          />
        ))}
      </main>
    </div>
  );
};
export default StatusColumn;
