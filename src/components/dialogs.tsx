"use client";

import {
  createProject,
  createStatus,
  createTask,
  signIn,
  updateStatus,
  updateTask,
} from "@/server/actions";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  useRef,
  useActionState,
  ComponentProps,
  RefObject,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Dialog, { useDialogs } from "./dialog";
import Form, { Button } from "./form";
import Select, { SelectInputHandle, SelectOption } from "./select";
import styles from "./styles.module.scss";
import { authClient } from "@/lib/auth-client";
import { Colors } from "@/lib/utils/shared";
import { Sketch } from "@uiw/react-color";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useMounted } from "@/lib/hooks";

interface DialogProps extends Omit<ComponentProps<typeof Dialog>, "ref"> {
  ref?: React.Ref<HTMLDialogElement>;
}
interface CreateTaskDialogProps extends DialogProps {}
export const CreateTaskDialog = ({
  isOpen,
  onClose,
  ...props
}: CreateTaskDialogProps) => {
  const { data: sessionData } = authClient.useSession();
  const createTaskDialogRef = useRef<HTMLDialogElement>(null);

  if (!sessionData) {
    createTaskDialogRef.current?.hidePopover();
  }

  const createTaskFormRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const selectProjectRef = useRef<SelectInputHandle>(null);
  const selectStatusRef = useRef<SelectInputHandle>(null);
  const tasksQueryKey = trpc.tasks.getTasks.queryKey();
  const [, taskFormAction, taskPending] = useActionState(createTask, null);
  const { data: projects } = useSuspenseQuery(
    trpc.projects.getProjects.queryOptions(),
  );
  const { data: statuses } = useSuspenseQuery(
    trpc.status.getStatuses.queryOptions(),
  );
  return (
    <Dialog
      {...props}
      isOpen={isOpen}
      onClose={onClose!}
      ref={createTaskDialogRef}
    >
      <Form
        ref={createTaskFormRef}
        onSubmit={() => {
          selectProjectRef.current?.clear();
          queryClient.invalidateQueries({
            queryKey: tasksQueryKey,
          });
          createTaskDialogRef.current?.requestClose();
        }}
        action={taskFormAction}
        className={styles.create_task_form}
      >
        <legend>new task</legend>
        <label htmlFor="create-task-title">Title</label>
        <input id="create-task-title" name="title" type="text" />
        <label htmlFor="create-task-description">Description</label>
        <textarea id="create-task-description" name="description" rows={3} />
        <label htmlFor="create-task-project">Project</label>
        <Select
          id="create-task-project"
          name="projectId"
          ref={selectProjectRef}
          options={projects.map((proj, index) => ({
            label: proj.title,
            value: proj.id,
            default: index === 0,
          }))}
        />
        <label htmlFor="create-task-status">Status</label>
        <Select
          id="create-task-status"
          name="statusId"
          ref={selectStatusRef}
          options={statuses.map((status, index) => ({
            label: status.name,
            value: status.id,
            default: status.default ?? index === 0,
          }))}
        />
        <Button disabled={taskPending} type="submit">
          submit
        </Button>
      </Form>
    </Dialog>
  );
};

interface ViewTaskDialogProps extends DialogProps {}
export const ViewTaskDialog = ({ isOpen, ...props }: ViewTaskDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const taskQueryKey = trpc.tasks.getTask.queryKey();
  const tasksQueryKey = trpc.tasks.getTasks.queryKey();
  const { openModal, closeModal, modalData } = useDialogs();
  const taskId = modalData.taskId;

  const { data: sessionData } = authClient.useSession();

  const { data: task } = useQuery(
    trpc.tasks.getTask.queryOptions(
      {
        taskId: taskId,
      },
      {
        enabled: !!taskId && isOpen,
        placeholderData: () => {
          const cacheTasks = queryClient.getQueryData(tasksQueryKey);
          const found = cacheTasks?.find((t) => t.id === taskId);
          if (found) return found;
        },
      },
    ),
  );
  const { data: statuses } = useSuspenseQuery(
    trpc.status.getStatuses.queryOptions(undefined, {
      enabled: !!task,
    }),
  );

  const [statusOpts, setStatusOpts] = useState<SelectOption[]>([]);

  const statusesKey = trpc.status.getStatuses.queryKey();
  const updateTaskStatus = useMutation(
    trpc.tasks.updateTaskStatus.mutationOptions({
      onMutate: async ({ newStatusId }) => {
        const prevData = queryClient.getQueryData(taskQueryKey);
        queryClient.setQueryData(taskQueryKey, (old) => ({
          ...old!,
          statusId: newStatusId,
        }));
        return { prevData };
      },
      onError: async (_err, _newData, ctx) => {
        queryClient.setQueryData(taskQueryKey, ctx!.prevData);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKey });
        await queryClient.invalidateQueries({ queryKey: taskQueryKey });
      },
    }),
  );

  const deleteStatus = useMutation(
    trpc.tasks.deleteTask.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKey });
        await queryClient.invalidateQueries({ queryKey: taskQueryKey });
      },
    }),
  );

  useEffect(() => {
    if (task?.statusId) {
      queryClient.invalidateQueries({ queryKey: statusesKey });
      setStatusOpts(
        statuses?.map((status, index) => ({
          label: status.name,
          value: status.id,
          default: status.default ?? index === 0,
          // default: task?.statusId === status.id,
        })) ?? [],
      );
    }
    if (taskId) {
      ref.current?.showModal();
    } else {
      ref.current?.requestClose();
    }

    return () => ref.current?.close();
  }, [task?.statusId, taskId]);

  return (
    <Dialog
      {...props}
      isOpen={isOpen}
      onClose={closeModal!}
      ref={ref as RefObject<HTMLDialogElement>}
      id={`task_dialog_${taskId}`}
    >
      <header>
        <h2>{task?.title}</h2>
        {task?.userId === sessionData?.user.id ? (
          <>
            <Select
              onValueChange={async (newVal) => {
                await updateTaskStatus.mutateAsync({
                  taskId: taskId,
                  newStatusId: newVal[0],
                });
              }}
              options={statusOpts ?? []}
            />
            <button
              onClick={() => {
                openModal("EDIT_TASK", {
                  taskId: taskId,
                });
              }}
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => {
                deleteStatus.mutate({ taskId: taskId });
                ref.current?.requestClose();
              }}
            >
              <TrashIcon />
            </button>
          </>
        ) : null}
      </header>
      <hr />
      <main>
        <p>{task?.description}</p>
      </main>
      <footer>
        <p>updated {task?.updatedAt.toLocaleDateString()}</p>
      </footer>
    </Dialog>
  );
};

interface UpdateTaskDialogProps extends DialogProps {}
export const UpdateTaskDialog = ({ ...props }: UpdateTaskDialogProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const updateTaskDialogRef = useRef<HTMLDialogElement>(null);
  const { data: sessionData } = authClient.useSession();

  if (!sessionData) {
    updateTaskDialogRef.current?.hidePopover();
  }
  const updateTaskFormRef = useRef<HTMLFormElement>(null);

  const { modalData } = useDialogs();
  const updateTaskWithTaskId = updateTask.bind(null, modalData.taskId);
  const [, taskFormAction, taskPending] = useActionState(
    updateTaskWithTaskId,
    null,
  );

  const { data: task } = useQuery(
    trpc.tasks.getTask.queryOptions(
      { taskId: modalData.taskId },
      { enabled: !!modalData.taskId },
    ),
  );

  return (
    <Dialog {...props} ref={updateTaskDialogRef}>
      <Form
        ref={updateTaskFormRef}
        onSubmit={() => {
          queryClient.invalidateQueries({
            queryKey: trpc.tasks.getTask.queryKey({
              taskId: modalData.taskId,
            }),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.tasks.getTasks.queryKey(),
          });
        }}
        action={taskFormAction}
      >
        <label htmlFor="update_task_title">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={task?.title}
          id="update_task_title"
        />
        <label htmlFor="update_task_description">Description</label>
        <textarea
          name="description"
          defaultValue={task?.description}
          id="update_task_description"
        />
        <button type="submit" disabled={taskPending}>
          {taskPending ? "Saving..." : "Save"}
        </button>
      </Form>
    </Dialog>
  );
};

interface CreateStatusProps extends DialogProps {}
export const CreateStatusDialog = ({ ...props }: CreateStatusProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createStatusDialogRef = useRef<HTMLDialogElement>(null);
  const { data: sessionData } = authClient.useSession();

  if (!sessionData) {
    createStatusDialogRef.current?.hidePopover();
  }

  const [, statusFormAction, statusPending] = useActionState(
    createStatus,
    null,
  );
  const createStatusFormRef = useRef<HTMLFormElement>(null);
  const [statusFormColorHex, setStatusFormColorHex] = useState<string>(
    Colors.blue,
  );

  const mounted = useMounted();

  const statusQueryKey = trpc.status.getStatuses.queryKey();
  return (
    <Dialog {...props} ref={createStatusDialogRef}>
      <Form
        ref={createStatusFormRef}
        onSubmit={() => {
          queryClient.invalidateQueries({
            queryKey: statusQueryKey,
          });
          createStatusDialogRef.current?.requestClose();
        }}
        action={statusFormAction}
        className={styles.create_status_form}
      >
        <legend>new status</legend>
        <label htmlFor="create-status-name">Name</label>
        <input id="create-status-name" name="name" type="text" />
        <label htmlFor="create-status-default">Default</label>
        <input type="checkbox" id="create-status-default" name="default" />
        <label htmlFor="create-status-color">Color</label>
        {mounted ? (
          <>
            <Sketch
              color={statusFormColorHex}
              onChange={(color) => setStatusFormColorHex(color.hex)}
            />
            <input name="color" value={statusFormColorHex} type="hidden" />
          </>
        ) : null}
        <Button disabled={statusPending} type="submit">
          submit
        </Button>
      </Form>
    </Dialog>
  );
};

interface UpdateStatusDialogProps extends CreateStatusProps {}
export const UpdateStatusDialog = ({ ...props }: UpdateStatusDialogProps) => {
  const trpc = useTRPC();

  const updateStatusDialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const statusesQueryKey = trpc.status.getStatuses.queryKey();
  const { modalData } = useDialogs();

  const statusId = modalData.statusId;

  const { data: status } = useQuery(
    trpc.status.getStatus.queryOptions(
      {
        statusId: statusId,
      },
      {
        enabled: !!statusId,
        placeholderData: () => {
          const statuses = queryClient.getQueryData(statusesQueryKey);
          const foundStatus = statuses?.find((s) => s.id === statusId);
          if (foundStatus) {
            return { ...foundStatus, tasks: [] };
          }
        },
      },
    ),
  );
  const [statusColor, setStatusColor] = useState(status?.color ?? "");
  const updateStatusWithId = updateStatus.bind(null, statusId);
  const [, updateStatusAction, updateStatusPending] = useActionState(
    updateStatusWithId,
    null,
  );

  const [showColor, setShowColor] = useState(false);

  useEffect(() => {
    if (!showColor) {
      setShowColor(true);
    }
    setStatusColor(status?.color!);
  }, [statusId]);

  useEffect(() => {
    if (showColor) {
      setStatusColor(status?.color!);
    }
  }, [showColor]);

  const statusKey = trpc.status.getStatus.queryKey({
    statusId,
  });
  const statusesKey = trpc.status.getStatuses.queryKey();
  return (
    <Dialog {...props} ref={updateStatusDialogRef}>
      <Form
        action={updateStatusAction}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: statusKey });
          queryClient.invalidateQueries({ queryKey: statusesKey });
          updateStatusDialogRef.current?.requestClose();
        }}
      >
        <legend>edit status</legend>
        <label htmlFor="edit_status_name">name</label>
        <input
          id="edit_status_name"
          type="text"
          name="name"
          defaultValue={status?.name}
        />
        <label htmlFor="edit_status_default">default</label>
        <input
          id="edit_status_name"
          type="checkbox"
          name="default"
          defaultChecked={status?.default}
        />
        <label htmlFor="edit_status_color">color</label>
        {showColor ? (
          <>
            <Sketch
              color={`${statusColor}`}
              onChange={(color) => setStatusColor(color.hex)}
            />
            <input type="hidden" name="color" value={statusColor ?? ""} />
          </>
        ) : null}
        <Button type="submit" disabled={updateStatusPending}>
          update
        </Button>
      </Form>
    </Dialog>
  );
};

interface CreateProjectDialogProps extends DialogProps {}

export const CreateProjectDialog = ({ ...props }: CreateProjectDialogProps) => {
  const createProjectDialogRef = useRef<HTMLDialogElement>(null);
  const [, formAction, pending] = useActionState(createProject, null);

  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const projectsKey = trpc.projects.getProjects.queryKey();

  const { data: sessionData } = authClient.useSession();

  if (!sessionData) {
    createProjectDialogRef.current?.hidePopover();
  }

  return (
    <Dialog {...props} ref={createProjectDialogRef}>
      <Form
        action={formAction}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: projectsKey });
          createProjectDialogRef.current?.requestClose();
        }}
      >
        <legend>create project</legend>
        <label htmlFor="create_project_title">Title</label>
        <input type="text" id="create_project_title" name="title" />
        <label htmlFor="create_project_description">description</label>
        <textarea id="create_project_description" name="description" />
        <Button type="submit" disabled={pending}>
          submit
        </Button>
      </Form>
    </Dialog>
  );
};

interface LoginDialogProps extends DialogProps {}
export const LoginDialog = ({ ...props }: LoginDialogProps) => {
  const [loginStatus, loginAction, formPending] = useActionState(signIn, null);
  const { refetch, data: sessionData } = authClient.useSession();
  const loginDialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (sessionData) {
      loginDialogRef.current?.requestClose();
    } else if (loginStatus?.message === "success") {
      refetch();
      router.refresh();
    }
  }, [sessionData, loginStatus]);
  return (
    <Dialog {...props} ref={loginDialogRef}>
      <Form action={loginAction}>
        <label htmlFor="loginEmail">Email</label>
        <input id="loginEmail" type="email" name="email" />
        <label htmlFor="loginPassword">Password</label>
        <input id="loginPassword" type="password" name="password" />
        <Button color="purple" disabled={formPending} type="submit">
          Login
        </Button>
      </Form>
    </Dialog>
  );
};
