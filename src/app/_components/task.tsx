"use client";

import { c } from "@/lib/utils/client";
import styles from "./styles.module.scss";
import { ErrorBoundary } from "react-error-boundary";
import { RouterOutput, useTRPC } from "@/trpc/client";
import { Suspense, ComponentProps } from "react";
import { useDialogs } from "@/components/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useDraggable } from "@dnd-kit/react";
import { authClient } from "@/lib/auth-client";
import { Colors } from "@/lib/utils/shared";

interface TaskProps extends ComponentProps<"div"> {
  task: RouterOutput["tasks"]["getTasks"][number];
  index: number;
  taskId: string;
  color: Colors;
}

const Task = ({ index, task, taskId, className, ...props }: TaskProps) => {
  const trpc = useTRPC();
  const { data: sessionData } = authClient.useSession();
  const queryClient = useQueryClient();
  const taskQueryKey = trpc.tasks.getTask.queryKey();

  const isUserTask = task.userId === sessionData?.user.id;

  console.log({ task });
  const { ref: draggableRef } = useDraggable({
    id: `draggable_${task.id}`,
    type: "item",
    disabled: !isUserTask,
    data: {
      type: "TASK",
      taskId: task.id,
      oldStatusId: task.statusId,
    },
  });

  const { openModal, modalData, activeModal } = useDialogs();
  return (
    <ErrorBoundary fallback={<p>error</p>}>
      <Suspense>
        <div
          {...props}
          className={c(
            styles.task,
            activeModal === "VIEW_TASK" && modalData.taskId === taskId
              ? styles.view_open
              : null,
            className,
          )}
          ref={draggableRef}
          onClick={() => {
            openModal("VIEW_TASK", { taskId: task.id });
            queryClient.invalidateQueries({ queryKey: taskQueryKey });
          }}
        >
          <h2>{task?.title}</h2>
          <p>{task?.description}</p>
          <p className={styles.date}>
            updated {task?.updatedAt.toLocaleDateString()}
          </p>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};
export default Task;
