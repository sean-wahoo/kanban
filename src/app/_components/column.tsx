"use client";

import { useTRPC } from "@/trpc/client";
import { PencilIcon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ComponentProps, useRef } from "react";
import styles from "./styles.module.scss";
import { useSortable } from "@dnd-kit/react/sortable";
import { useDialogs } from "@/components/dialog";

interface StatusColumnProps extends ComponentProps<"div"> {
  statusId: string;
  index: number;
}
const StatusColumn = ({
  statusId,
  index,
  children,
  ...props
}: StatusColumnProps) => {
  const trpc = useTRPC();

  const updateStatusDialogRef = useRef<HTMLDialogElement>(null);
  const { ref: columnSlotRef } = useSortable({
    id: `column_${statusId}`,
    index,
    disabled: updateStatusDialogRef.current?.open,
    data: {
      type: "COLUMN",
      statusId,
    },
  });

  const { openModal } = useDialogs();

  const queryClient = useQueryClient();

  const statusKey = trpc.status.getStatus.queryKey({
    statusId,
  });
  const statusesKey = trpc.status.getStatuses.queryKey();

  const deleteStatusMutation = useMutation(
    trpc.status.deleteStatus.mutationOptions({
      onSettled: async () => {
        queryClient.invalidateQueries({ queryKey: statusKey });
        queryClient.invalidateQueries({ queryKey: statusesKey });
      },
    }),
  );

  return (
    <div
      {...props}
      id={`status_column_${statusId}`}
      className={styles.status_column}
      ref={columnSlotRef}
    >
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
      {children}
    </div>
  );
};
export default StatusColumn;
