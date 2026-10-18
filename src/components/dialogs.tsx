import { authClient } from "@/lib/auth-client";
import { createProject, createTask, updateTask } from "@/server/actions";
import { RouterOutput, useTRPC } from "@/trpc/client";
import { Button, Dialog, Input, Form, Field, Fieldset } from "@base-ui/react";
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  useRef,
  useActionState,
  SubmitEvent,
  useState,
  useEffect,
  Suspense,
  useLayoutEffect,
} from "react";
// import { Button } from "./form";
import { SelectInputHandle } from "./select";
import styles from "./styles.module.scss";
import componentStyles from "@/app/_components/styles.module.scss";
import z from "zod";
import Select from "./select";
import Spinner from "./spinner";
import { Task } from "@/server/db";
import { c } from "@/lib/utils/client";
import { ArrowLeftIcon, EditIcon, XIcon } from "lucide-react";

interface BaseFieldProps {
  name: string;
  label: string;
  controlProps?: Field.Control.Props;
  labelProps?: Field.Label.Props;
}
const BaseField = ({
  name,
  label,
  controlProps,
  labelProps,
}: BaseFieldProps) => {
  return (
    <Field.Root className={styles.field}>
      <Field.Label className={styles.label} {...labelProps}>
        {label}
      </Field.Label>
      <Field.Control
        className={styles.input}
        type="text"
        name={name}
        {...controlProps}
      />
      <Field.Error className={styles.error} />
    </Field.Root>
  );
};

interface CreateTaskDialogProps {
  handle: Dialog.Handle<HTMLElement>;
  task?: Task;
}
export const CreateTaskDialog = ({ handle }: CreateTaskDialogProps) => {
  const createTaskDialogRef = useRef<HTMLDialogElement>(null);
  const { data: sessionData } = authClient.useSession();
  if (!sessionData) {
    createTaskDialogRef.current?.hidePopover();
  }
  const createTaskFormRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const tasksQueryKey = trpc.tasks.getTasks.queryKey();
  const [state, taskFormAction, taskPending] = useActionState(createTask, {});
  const { data: projects, isLoading: isProjectsLoading } = useQuery(
    trpc.projects.getProjects.queryOptions(),
  );
  const { data: statuses } = useQuery(trpc.status.getStatuses.queryOptions());
  const selectProjectRef = useRef<SelectInputHandle>(null);
  const selectStatusRef = useRef<SelectInputHandle>(null);

  useEffect(() => {
    if (!taskPending) {
      handle.close();
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    }
  }, [taskPending]);

  return (
    <Dialog.Root handle={handle}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <Form
            action={taskFormAction}
            ref={createTaskFormRef}
            className={styles.form}
            errors={state.errors}
          >
            <Fieldset.Root className={styles.fieldset}>
              {state.formError ? (
                <div className={styles.error}>{state.formError}</div>
              ) : null}
              <Fieldset.Legend className={styles.legend}>
                new task
              </Fieldset.Legend>
              <BaseField
                name="title"
                label="Title"
                controlProps={{ required: true }}
              />
              <BaseField name="description" label="Description" />
              <Field.Root className={styles.field}>
                <Field.Label className={styles.label}>Project</Field.Label>
                <Select
                  id="create-task-project"
                  ref={selectProjectRef}
                  placeholder="Select a project"
                  loading={isProjectsLoading}
                  name="projectId"
                  options={
                    projects?.map((project) => ({
                      value: project.id,
                      label: project.title,
                    })) || []
                  }
                />
                <Field.Error className={styles.error} />
              </Field.Root>
              <Field.Root className={styles.field}>
                <Field.Label className={styles.label}>Status</Field.Label>
                <Select
                  id="create-task-status"
                  ref={selectStatusRef}
                  placeholder="Select a status"
                  name="statusId"
                  options={
                    statuses?.map((status) => ({
                      value: status.id,
                      label: status.name,
                    })) || []
                  }
                />
                <Field.Error className={styles.error} />
              </Field.Root>
            </Fieldset.Root>
            <Button disabled={taskPending} type="submit">
              submit
            </Button>
          </Form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

interface LoginDialogProps {
  handle: Dialog.Handle<HTMLElement>;
}
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");
// .regex(/[^A-Za-z0-9]/, "Password must contain a special character");
const loginActionSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});
export const LoginDialog = ({ handle }: LoginDialogProps) => {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>();
  const onLoginFormSubmit = (formValues: Form.Values) => {
    const { data, error, success } = loginActionSchema.safeParse(formValues);
    if (!success) {
      setErrors(z.flattenError(error).fieldErrors);
      return {
        errors: z.flattenError(error).fieldErrors,
      };
    }
    try {
      authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
    } catch (e) {
      console.log({ e });
    } finally {
      setOpen(false);
    }
  };
  return (
    <Dialog.Root handle={handle} open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <Form
            errors={errors}
            className={styles.form}
            onFormSubmit={onLoginFormSubmit}
          >
            <Fieldset.Root className={styles.fieldset}>
              <Fieldset.Legend className={styles.legend}>login</Fieldset.Legend>
              <BaseField
                name="email"
                label="email"
                controlProps={{
                  type: "email",
                }}
              />
              <BaseField
                name="password"
                label="password"
                controlProps={{ type: "password" }}
              />
            </Fieldset.Root>
            <Button type="submit">submit</Button>
          </Form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

interface CreateProjectDialogProps {
  handle: Dialog.Handle<HTMLElement>;
}

export const CreateProjectDialog = ({ handle }: CreateProjectDialogProps) => {
  const [state, createProjectAction, projectPending] = useActionState(
    createProject,
    {},
  );

  useEffect(() => {
    if (!projectPending) {
      handle.close();
    }
  }, [projectPending]);

  return (
    <Dialog.Root handle={handle}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <Form
            className={styles.form}
            action={createProjectAction}
            errors={state.errors}
          >
            <Fieldset.Root className={styles.fieldset}>
              <Fieldset.Legend className={styles.legend}>
                create project
              </Fieldset.Legend>

              <BaseField
                label="Title"
                name="title"
                controlProps={{ required: true }}
              />

              <BaseField label="Description" name="description" />
              {state.formError ? (
                <div className={styles.error}>{state.formError}</div>
              ) : null}
            </Fieldset.Root>
            <Button type="submit" disabled={projectPending}>
              {projectPending ? <Spinner /> : "submit"}
            </Button>
          </Form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

interface TaskDialogHandleProps {
  taskId: string;
  mode?: "view" | "edit";
  setMode?: (mode: "view" | "edit") => void;
  setHeight?: (height: number) => void;
  ref: React.RefObject<HTMLDivElement | null>;
}
interface TaskDialogProps {
  handle: Dialog.Handle<TaskDialogHandleProps>;
}

const ViewTaskDetails = ({
  taskId,
  setHeight,
  mode,
  setMode,
  ref,
}: TaskDialogHandleProps) => {
  const trpc = useTRPC();
  const { data: task } = useSuspenseQuery(
    trpc.tasks.getTask.queryOptions({ taskId }),
  );
  const { data: sessionData } = authClient.useSession();
  useEffect(() => {
    const el = document.getElementById("view_task_details");
    if (mode === "view") {
      setHeight?.(el?.getBoundingClientRect().height || 0);
    }
  }, [mode]);
  return (
    <div
      id="view_task_details"
      className={c(styles.view_task_dialog, styles.change_transition)}
      ref={ref}
    >
      <header className={styles.header}>
        <Dialog.Title>{task.title}</Dialog.Title>

        <div className={styles.buttons}>
          {sessionData?.user?.id === task.userId ? (
            <button
              className={styles.edit_button}
              onClick={() => setMode?.("edit")}
            >
              <EditIcon size={18} />
            </button>
          ) : null}
          <Dialog.Close className={styles.close_button}>
            <XIcon size={22} />
          </Dialog.Close>
        </div>
      </header>
      <main className={styles.main}>
        <p>{task.description}</p>
      </main>
      <footer className={styles.footer}>
        <p className={styles.created}>
          created {task.createdAt.toLocaleString()}
        </p>
        <p className={styles.updated}>
          updated {task.updatedAt.toLocaleString()}
        </p>
      </footer>
    </div>
  );
};

const EditTaskDetails = ({
  taskId,
  setHeight,
  mode,
  setMode,
  ref,
}: TaskDialogHandleProps) => {
  const trpc = useTRPC();
  const { data: task } = useSuspenseQuery(
    trpc.tasks.getTask.queryOptions({ taskId }),
  );
  const taskQueryKey = trpc.tasks.getTask.queryKey();
  const { data: statuses } = useSuspenseQuery(
    trpc.status.getStatuses.queryOptions(),
  );
  const { data: projects } = useSuspenseQuery(
    trpc.projects.getProjects.queryOptions(),
  );
  const editTaskFormRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();
  const tasksQueryKey = trpc.tasks.getTasks.queryKey();
  const updateTaskWithId = updateTask.bind(null, task?.id || "");
  const [state, taskFormAction, updateTaskPending] = useActionState(
    updateTaskWithId,
    { taskId: task?.id || "" },
  );
  useEffect(() => {
    const el = document.getElementById("edit_task_details");

    if (!updateTaskPending) {
      queryClient.invalidateQueries({
        queryKey: taskQueryKey,
      });
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey,
      });
    }
    if (mode === "edit") {
      setHeight?.(el?.getBoundingClientRect().height || 0);
      return () => {
        setMode?.("view");
      };
    }
  }, [mode, setMode, updateTaskPending]);

  return (
    <div
      id="edit_task_details"
      className={c(styles.edit_task_dialog, styles.change_transition)}
      ref={ref}
    >
      <header className={styles.header}>
        <Dialog.Title>edit task</Dialog.Title>

        <div className={styles.buttons}>
          <button
            className={styles.back_button}
            onClick={() => setMode?.("view")}
          >
            <ArrowLeftIcon size={22} />
          </button>
          <Dialog.Close className={styles.close_button}>
            <XIcon size={22} />
          </Dialog.Close>
        </div>
      </header>
      <Form
        className={styles.form}
        action={taskFormAction}
        ref={editTaskFormRef}
      >
        <Fieldset.Root className={styles.fieldset}>
          {/* <Fieldset.Legend className={styles.legend}>edit task</Fieldset.Legend> */}
          <BaseField
            name="title"
            label="Title"
            controlProps={{
              defaultValue: task.title,
              disabled: updateTaskPending,
            }}
          />
          <BaseField
            name="description"
            label="Description"
            controlProps={{
              defaultValue: task.description,
              disabled: updateTaskPending,
            }}
          />
          <Field.Root className={styles.field}>
            <Field.Label className={styles.label}>Status</Field.Label>
            <Select
              id="edit-task-status"
              name="statusId"
              defaultValue={task.statusId ?? ""}
              aria-disabled={updateTaskPending}
              options={statuses.map((status) => ({
                value: status.id,
                label: status.name,
              }))}
            />
          </Field.Root>
          <Field.Root className={styles.field}>
            <Field.Label className={styles.label}>Project</Field.Label>
            <Select
              id="edit-task-project"
              name="projectId"
              defaultValue={task.projectId ?? ""}
              aria-disabled={updateTaskPending}
              options={projects.map((project) => ({
                value: project.id,
                label: project.title,
              }))}
            />
          </Field.Root>
          <Button type="submit" disabled={updateTaskPending}>
            submit
          </Button>
        </Fieldset.Root>
      </Form>
    </div>
  );
};

const TaskLoading = () => {
  const shimmerStyle = c(componentStyles.shimmer, componentStyles.text_line);
  return (
    <div className={styles.change_transition}>
      <Dialog.Title className={shimmerStyle} style={{ width: "80%" }} />
      <div>
        <p
          className={shimmerStyle}
          style={{ width: "70%", height: "0.8rem" }}
        />
        <p
          className={shimmerStyle}
          style={{ width: "70%", height: "0.8rem" }}
        />
      </div>
    </div>
  );
};

export const TaskDialog = ({ handle }: TaskDialogProps) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [height, setHeight] = useState<number>();

  const [updateFunc, setUpdateFunc] = useState<(() => void) | null>(null);

  const viewRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);

  const refs = {
    view: viewRef,
    edit: editRef,
  };
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    if (!mode || !open) return;
    const el = refs[mode].current;
    console.log({ el });
    if (!el) return;
    const updateHeight = () => {
      const newHeight = el?.getBoundingClientRect().height;
      // if (newHeight === height || newHeight === 0) return;
      setHeight(newHeight);
    };
    setUpdateFunc(updateHeight);
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
      setHeight(undefined);
      // setUpdateFunc(null);
    };
  }, [mode, open, refs]);
  return (
    <Dialog.Root
      handle={handle}
      onOpenChange={(open) => {
        // const el = document.querySelector(`#${mode}_task_details`);
        // const elHeight = el?.getBoundingClientRect().height;
        setOpen(open);
        // setHeight(elHeight);
      }}
      open={open}
    >
      {({ payload }) => {
        useEffect(() => {
          if (payload?.mode && payload.mode !== mode) {
            setMode(payload.mode);
          }
          // updateFunc?.();
        }, [payload]);
        return (
          <Dialog.Portal>
            <Dialog.Backdrop className={styles.backdrop} />
            <Dialog.Popup className={styles.popup}>
              <div
                className={styles.popup_inner}
                style={{
                  height: height,
                }}
              >
                {payload ? (
                  <Suspense fallback={<TaskLoading />}>
                    <div
                      className={c(
                        styles.auto_height_child,
                        styles.view,
                        mode === "view" ? null : styles.hidden,
                      )}
                    >
                      <ViewTaskDetails
                        taskId={payload.taskId}
                        mode={mode}
                        ref={viewRef}
                        setMode={setMode}
                        setHeight={setHeight}
                      />
                    </div>
                    <div
                      className={c(
                        styles.auto_height_child,
                        styles.edit,
                        mode === "edit" ? null : styles.hidden,
                      )}
                    >
                      <EditTaskDetails
                        taskId={payload.taskId}
                        ref={editRef}
                        mode={mode}
                        setMode={setMode}
                        setHeight={setHeight}
                      />
                    </div>
                  </Suspense>
                ) : (
                  <TaskLoading />
                )}
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        );
      }}
    </Dialog.Root>
  );
};
