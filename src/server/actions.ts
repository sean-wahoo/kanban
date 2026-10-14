"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";
import { db } from "@/server/db";
import { projects, statuses, tasks } from "@/server/db";
import { nanoid } from "@/lib/id";
import { zfd } from "zod-form-data";
import { assertAuth, getIPAuth } from "@/lib/utils/server";
import { getBaseURL } from "@/lib/utils/shared";
import { and, eq } from "drizzle-orm";
import { FormState } from "@/components/form";

const CreateStatusSchema = zfd.formData({
  name: zfd.text(z.string()),
  default: zfd.checkbox().default(false),
  color: zfd
    .text(z.string())
    .refine(
      (val) => /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(val),
      "please provide a hex value",
    ),
});
const CreateTaskSchema = zfd.formData({
  title: zfd.text(z.string()),
  description: zfd.text(z.string().optional()),
  statusId: zfd.text(z.string().optional()),
  projectId: zfd.text(z.string().optional()),
});

export async function createStatus(_prevData: any, formData: FormData) {
  try {
    const { user } = await assertAuth();

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } =
      await CreateStatusSchema.safeParseAsync(rawData);

    if (!success) {
      return {
        message: "zod error",
        error: z.flattenError(error),
      };
    }

    const [newStatus] = await db
      .insert(statuses)
      .values({
        id: nanoid(9),
        name: data.name,
        color: data.color,
        default: data.default,
        userId: user.id,
      })
      .returning();

    return { message: "success", statusId: newStatus.id };
  } catch (e) {
    console.error(e);
    return { message: "error", error: e };
  }
}

export async function updateStatus(
  statusId: string,
  _prevData: any,
  formData: FormData,
) {
  try {
    const { user } = await assertAuth();

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } =
      await CreateStatusSchema.safeParseAsync(rawData);

    if (!success) {
      return {
        message: "zod error",
        error: z.flattenError(error),
      };
    }

    const [newStatus] = await db
      .update(statuses)
      .set({
        name: data.name,
        color: data.color,
        default: data.default,
        updatedAt: new Date(),
      })
      .where(and(eq(statuses.id, statusId), eq(statuses.userId, user.id)))
      .returning();

    return { message: "success", statusId: newStatus.id };
  } catch (e) {
    console.error(e);
    return { message: "error", error: e };
  }
}
interface CreateTaskFormState extends FormState {
  taskId?: string;
}
export async function createTask(
  _prevData: CreateTaskFormState | FormState,
  formData: FormData,
): Promise<CreateTaskFormState | FormState> {
  try {
    const { user } = await assertAuth();

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } =
      await CreateTaskSchema.safeParseAsync(rawData);

    if (!success) {
      return {
        errors: z.flattenError(error).fieldErrors,
      };
    }

    if (!data.statusId) {
      const [defaultStatus] = await db
        .select()
        .from(statuses)
        .where(and(eq(statuses.default, true), eq(statuses.userId, user.id)))
        .limit(1);
      if (!defaultStatus) {
        return {
          formError: "no default status found",
        };
      }
      data.statusId = defaultStatus.id;
    }

    const [newTask] = await db
      .insert(tasks)
      .values({
        id: nanoid(9),
        title: data.title,
        description: data.description ?? "",
        projectId: data.projectId,
        statusId: data.statusId,
        userId: user.id,
      })
      .returning();

    return { taskId: newTask.id };
  } catch (e) {
    const errorMessage = `createTask oops! - ${e}`;
    console.error(errorMessage);
    return { formError: errorMessage };
  }
}

interface UpdateTaskFormState extends CreateTaskFormState {}
export async function updateTask(
  taskId: string,
  _prevData: UpdateTaskFormState,
  formData: FormData,
) {
  try {
    const { user } = await assertAuth();

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } =
      await CreateTaskSchema.safeParseAsync(rawData);

    if (!success) {
      return {
        message: "zod error",
        error: z.flattenError(error),
      };
    }

    const [newTask] = await db
      .update(tasks)
      .set({
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        statusId: data.statusId,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
      .returning();

    return { taskId: newTask.id };
  } catch (e) {
    const errorMessage = `updateTask oops! - ${e}`;
    console.error(errorMessage);
    return { formError: errorMessage };
  }
}

const ProjectSchema = zfd.formData({
  title: zfd.text(z.string()),
  description: zfd.text(z.string()),
});
interface CreateProjectFormState extends FormState {
  projectId?: string;
}
export async function createProject(
  _prevState: FormState,
  formData: FormData,
): Promise<CreateProjectFormState | FormState> {
  try {
    const { user } = await assertAuth();

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } =
      await ProjectSchema.safeParseAsync(rawData);
    if (!success) {
      return {
        errors: z.flattenError(error).fieldErrors,
      };
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        id: nanoid(9),
        title: data.title,
        description: data.description,
        userId: user.id,
      })
      .returning();

    return { projectId: newProject.id };
  } catch (e) {
    const errorMessage = `createProject oops! - ${e}`;
    console.error(e);
    return { formError: errorMessage };
  }
}
