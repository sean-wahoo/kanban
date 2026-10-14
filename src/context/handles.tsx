"use client";
import { TaskDialog } from "@/components/dialogs";
import { type Task } from "@/trpc/client";
import { Dialog } from "@base-ui/react";
import { createContext, useContext, useEffect, useState } from "react";

interface TaskDialogHandleProps {
  taskId: string;
  mode?: "view" | "edit";
}

export const HandlesContext = createContext({
  Task: Dialog.createHandle<TaskDialogHandleProps>(),
});

export const useHandles = () => {
  return useContext(HandlesContext);
};

export const HandlesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [handles] = useState({
    Task: Dialog.createHandle<TaskDialogHandleProps>(),
  });
  useEffect(() => {}, []);
  return (
    <HandlesContext.Provider value={handles}>
      <TaskDialog handle={handles.Task} />
      {children}
    </HandlesContext.Provider>
  );
};
