"use client";

import { c } from "@/lib/utils";
import styles from "./styles.module.scss";
import { ErrorBoundary } from "react-error-boundary";
import { RouterOutput, useTRPC } from "@/trpc/client";
import { Suspense, ComponentProps } from "react";
import { useDialogs } from "@/components/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useDraggable } from "@dnd-kit/react";

interface TaskProps extends ComponentProps<"div"> {
  task: RouterOutput["tasks"]["getTasks"][number];
  index: number;
  taskId: string;
}

const Task = ({ index, task, taskId, className, ...props }: TaskProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const taskQueryKey = trpc.tasks.getTask.queryKey();

  const { ref: draggableRef } = useDraggable({
    id: `draggable_${task.id}`,
    type: "item",
    data: {
      type: "TASK",
      taskId: task.id,
      oldStatusId: task.statusId,
    },
  });

  const { openModal } = useDialogs();
  return (
    <ErrorBoundary fallback={<p>error</p>}>
      <Suspense>
        <div
          {...props}
          className={c(styles.task, className)}
          ref={draggableRef}
          onClick={() => {
            openModal("VIEW_TASK", { taskId: task.id });
            queryClient.invalidateQueries({ queryKey: taskQueryKey });
          }}
        >
          <h2>{task?.title}</h2>
          <p>{task?.description}</p>
          <footer>updated {task?.updatedAt.toLocaleDateString()}</footer>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};
export default Task;
