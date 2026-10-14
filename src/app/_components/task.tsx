"use client";

import { c } from "@/lib/utils/client";
import styles from "./styles.module.scss";
import { ErrorBoundary } from "react-error-boundary";
import { RouterOutput, useTRPC } from "@/trpc/client";
import { Suspense, ComponentProps, use, useState } from "react";
import { Dialog } from "@base-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useDraggable } from "@dnd-kit/react";
import { authClient } from "@/lib/auth-client";
import { Colors } from "@/lib/utils/shared";
import { useHandles } from "@/context/handles";

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

  // const { openModal, modalData, activeModal } = useDialogs();
  // const [viewOpen, setViewOpen] = useState(false);
  const { Task: TaskDialogHandle } = useHandles();
  return (
    <>
      <div
        {...props}
        className={c(styles.task, className)}
        ref={draggableRef}
        onClick={() => {
          // openModal("VIEW_TASK", { taskId: task.id });
          // setViewOpen(true);
          // queryClient.invalidateQueries({ queryKey: taskQueryKey });
          // queryClient.invalidateQueries({ queryKey: taskQueryKey });
          TaskDialogHandle.openWithPayload({ taskId: task.id, mode: "view" });
        }}
      >
        <h2>{task?.title}</h2>
        <p>{task?.description}</p>
        <p className={styles.date}>
          updated {task?.updatedAt.toLocaleDateString()}
        </p>
      </div>
      {/* <ViewTaskDialog */}
      {/*   open={viewOpen} */}
      {/*   onOpenChange={setViewOpen} */}
      {/*   taskId={taskId} */}
      {/* /> */}
    </>
  );
};

export const TaskLoading = () => {
  return (
    <div className={c(styles.task, styles.loading)}>
      <div className={c(styles.shimmer, styles.text_line)} />
      <div
        style={{ width: "80%", height: "0.6rem" }}
        className={c(styles.shimmer, styles.text_line)}
      />
      <div
        style={{ width: "80%", height: "0.6rem" }}
        className={c(styles.shimmer, styles.text_line)}
      />
      <div
        style={{ width: "70%", height: "0.6rem", marginTop: "0.4rem" }}
        className={c(styles.shimmer, styles.text_line)}
      />
    </div>
  );
};

export default Task;
