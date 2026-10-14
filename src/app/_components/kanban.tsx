"use client";
import { type Task, useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense, useState } from "react";
import styles from "./styles.module.scss";
import { DragDropProvider } from "@dnd-kit/react";
import Column, { ColumnLoading } from "./column";
import { TaskDialog } from "@/components/dialogs";
import { useAtomValue } from "jotai";
import { editingTaskAtom } from "@/store/task";
import { Dialog } from "@base-ui/react";

export const KanbanLoading = () => {
  return (
    <div className={styles.status_columns}>
      {Array.from({ length: 3 }).map((_, i) => (
        <ColumnLoading key={`column_loading_${i}`} />
      ))}
    </div>
  );
};

const Kanban = () => {
  const trpc = useTRPC();
  const { data: statuses } = useSuspenseQuery(
    trpc.status.getStatuses.queryOptions(),
  );

  // const [editingTask, setEditingTask] = useState<Task | null>();
  const editingTask = useAtomValue(editingTaskAtom);

  const statusesKey = trpc.status.getStatuses.queryKey();
  const tasksKey = trpc.tasks.getTasks.queryKey();
  const updateStatusOrders = useMutation(
    trpc.status.updateStatusOrders.mutationOptions({
      onMutate: async ({ statuses }) => {
        queryClient.setQueryData(statusesKey, (prev) => {
          if (!prev) {
            return [];
          }
          const next = prev.map((status) => {
            const foundStatuses = statuses.filter((s) => s.id === status.id);
            if (foundStatuses.length > 0) {
              const foundStatus = foundStatuses.find((s) => s.id === status.id);
              if (foundStatus) {
                status.order = foundStatus.newOrder;
              }
            }
            return status;
          });

          return next;
        });
        return { statuses };
      },
      onSettled: async () => {
        queryClient.invalidateQueries({ queryKey: statusesKey });
      },
    }),
  );
  const updateTaskStatus = useMutation(
    trpc.tasks.updateTaskStatus.mutationOptions({
      onMutate: async ({ taskId, newStatusId }) => {
        queryClient.setQueryData(tasksKey, (prev) => {
          if (!prev) {
            return [];
          }
          const next = prev.map((task) => {
            if (task.id === taskId) {
              return { ...task, statusId: newStatusId };
            }
            return task;
          });

          return next;
        });
        return { taskId, newStatusId };
      },
      onSettled: async (_obj, _data, res) => {
        const tasksQueryKey = trpc.tasks.getTasks.queryKey({
          statusIds: [res.newStatusId],
        });
        queryClient.invalidateQueries({
          queryKey: tasksQueryKey,
        });
      },
      onSuccess: async () => {},
    }),
  );

  const queryClient = useQueryClient();
  const editTaskDialogHandle = Dialog.createHandle<HTMLElement>();

  return (
    <div className={styles.status_columns}>
      <Suspense fallback={<KanbanLoading />}>
        <TaskDialog task={editingTask} handle={editTaskDialogHandle} />
        <ErrorBoundary errorComponent={() => <p>status column error!</p>}>
          <DragDropProvider
            onDragEnd={async (e) => {
              if (e.canceled) return;

              if (e.operation.source?.data?.type) {
                switch (e.operation.source.data.type) {
                  case "COLUMN":
                    const columns = Array.from(
                      document.querySelectorAll(
                        `.${styles.status_column}:not([aria-hidden="true"])`,
                      ),
                    );

                    const indexes = columns.map((c, i) => ({
                      id: c.id.split("status_column_")[1],
                      newOrder: i,
                    }));

                    await updateStatusOrders.mutateAsync({
                      statuses: indexes,
                    });
                    break;
                  case "TASK":
                    const taskId = e.operation.source?.data.taskId as string;
                    const oldStatusId = e.operation.source?.data
                      .oldStatusId as string;
                    const newStatusId =
                      e.operation.target?.element?.id?.split(
                        `status_column_`,
                      )?.[1];
                    if (!newStatusId || oldStatusId === newStatusId) return;
                    await updateTaskStatus.mutateAsync({
                      taskId,
                      newStatusId,
                    });
                    break;
                }
              }
            }}
          >
            {statuses
              .sort((a, b) => a.order - b.order)
              .map((status) => {
                return (
                  <Column
                    loading={true}
                    key={status.id}
                    status={status}
                    index={status.order}
                  />
                );
              })}
          </DragDropProvider>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

export default Kanban;
