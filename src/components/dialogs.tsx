"use client";

import {
  createStatus,
  createTask,
  signIn,
  updateStatus,
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
  createRef,
  RefObject,
  useEffect,
  useState,
} from "react";
import Dialog, { useDialogs } from "./dialog";
import Form, { Button } from "./form";
import Select, { SelectInputHandle, SelectOption } from "./select";
import styles from "./styles.module.scss";
import { authClient } from "@/lib/auth-client";
import { Colors } from "@/lib/utils";
import { Sketch } from "@uiw/react-color";

interface TaskDialogProps extends Omit<ComponentProps<typeof Dialog>, "ref"> {}
interface CreateTaskDialogProps extends TaskDialogProps {}
export const CreateTaskDialog = ({
  isOpen,
  onClose,
  ...props
}: CreateTaskDialogProps) => {
  const { data: sessionData } = authClient.useSession();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const selectProjectRef = useRef<SelectInputHandle>(null);
  const createTaskDialogRef = useRef<HTMLDialogElement>(null);
  const selectStatusRef = useRef<SelectInputHandle>(null);
  const tasksQueryKey = trpc.tasks.getTasks.queryKey();
  const createTaskWithUserId = createTask.bind(
    null,
    sessionData?.user.id ?? "",
  );
  const [, taskFormAction, taskPending] = useActionState(
    createTaskWithUserId,
    null,
  );
  const { data: projects } = useSuspenseQuery(
    trpc.projects.getProjects.queryOptions(),
  );
  const { data: statuses } = useSuspenseQuery(
    trpc.status.getStatuses.queryOptions(),
  );
  const createTaskFormRef = useRef<HTMLFormElement>(null);
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
          options={projects.map((proj) => ({
            label: proj.title,
            value: proj.id,
          }))}
        />
        <label htmlFor="create-task-status">Status</label>
        <Select
          id="create-task-status"
          name="statusId"
          ref={selectStatusRef}
          options={statuses.map((status) => ({
            label: status.name,
            value: status.id,
          }))}
        />
        <Button disabled={taskPending} type="submit">
          submit
        </Button>
      </Form>
    </Dialog>
  );
};

interface ViewTaskDialogProps extends TaskDialogProps {}
export const ViewTaskDialog = ({ isOpen, ...props }: ViewTaskDialogProps) => {
  const ref = createRef<HTMLDialogElement>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const taskQueryKey = trpc.tasks.getTask.queryKey();
  const tasksQueryKey = trpc.tasks.getTasks.queryKey();
  const { activeModal, closeModal, modalData } = useDialogs();
  const taskId = modalData.taskId;
  const { data: task } = useQuery(
    trpc.tasks.getTask.queryOptions(
      {
        taskId: taskId,
      },
      {
        enabled: !!taskId && dialogOpen,
        placeholderData: () => {
          const cacheTasks = queryClient.getQueryData(tasksQueryKey);
          return cacheTasks?.find((t) => t.id === taskId);
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
      onMutate: async ({ taskId, newStatusId }) => {
        const prevData = queryClient.getQueryData(taskQueryKey);
        queryClient.setQueryData(taskQueryKey, (old) => ({
          ...old!,
          statusId: newStatusId,
        }));
        return { prevData };
      },
      onError: async (err, newData, ctx) => {
        queryClient.setQueryData(taskQueryKey, ctx!.prevData);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKey });
        await queryClient.invalidateQueries({ queryKey: taskQueryKey });
      },
    }),
  );

  useEffect(() => {
    if (task?.statusId) {
      queryClient.invalidateQueries({ queryKey: statusesKey });
    }
    if (taskId) {
      ref.current!.showModal();
    } else {
      ref.current?.requestClose();
    }

    return () => ref.current?.close();
  }, [taskId]);

  useEffect(() => {
    if (task?.statusId) {
      setStatusOpts(
        statuses?.map((status) => ({
          label: status.name,
          value: status.id,
          default: task?.statusId === status.id,
        })) ?? [],
      );
    }
  }, [task?.statusId]);

  return (
    <Dialog
      {...props}
      isOpen={isOpen}
      onClose={closeModal!}
      className={styles.task_dialog}
      ref={ref as RefObject<HTMLDialogElement>}
      id={`task_dialog_${taskId}`}
    >
      <header>
        <h2>{task?.title}</h2>
        <Select
          onValueChange={async (newVal, oldVal) => {
            await updateTaskStatus.mutateAsync({
              taskId: taskId,
              newStatusId: newVal[0],
            });
          }}
          options={statusOpts ?? []}
        />
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

interface CreateStatusProps extends TaskDialogProps {}
export const CreateStatusDialog = ({ ...props }: CreateStatusProps) => {
  const { data: sessionData } = authClient.useSession();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createStatusDialogRef = useRef<HTMLDialogElement>(null);
  const createStatusWithUserId = createStatus.bind(
    null,
    sessionData?.user.id ?? "",
  );

  const [statusState, statusFormAction, statusPending] = useActionState(
    createStatusWithUserId,
    null,
  );
  const createStatusFormRef = useRef<HTMLFormElement>(null);
  const [statusFormColorHex, setStatusFormColorHex] = useState<string>(
    Colors.blue,
  );
  const [statusFormColorMounted, setStatusFormColorMounted] = useState(false);
  useEffect(() => {
    setStatusFormColorMounted(true);
  }, []);

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
        {statusFormColorMounted ? (
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
        initialData: () => {
          const statuses = queryClient.getQueryData(statusesQueryKey);
          const foundStatus = statuses?.find((s) => s.id === statusId);
          if (foundStatus) {
            return foundStatus;
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

interface LoginDialogProps extends TaskDialogProps {}
export const LoginDialog = ({ ...props }: LoginDialogProps) => {
  const [, loginAction, pending] = useActionState(signIn, null);
  const { data: session } = authClient.useSession();
  const loginDialogRef = useRef<HTMLDialogElement>(null);
  return (
    <Dialog {...props} ref={loginDialogRef}>
      <Form action={loginAction}>
        <label htmlFor="loginEmail">Email</label>
        <input id="loginEmail" type="email" name="email" />
        <label htmlFor="loginPassword">Password</label>
        <input id="loginPassword" type="password" name="password" />
        <Button color="purple" disabled={pending} type="submit">
          Login
        </Button>
      </Form>
    </Dialog>
  );
};
