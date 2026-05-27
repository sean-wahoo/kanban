"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { zfd } from "zod-form-data";
import { assertAuth, getIPAuth } from "@/lib/utils/server";
import { getBaseURL } from "@/lib/utils/shared";

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
  description: zfd.text(z.string()),
  statusId: zfd.text(z.optional(z.string())),
  projectId: zfd.text(z.optional(z.string())),
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

    const newStatus = await prisma.status.create({
      data: {
        name: data.name,
        color: data.color,
        userId: user.id,
      },
    });

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

    const newStatus = await prisma.status.update({
      where: {
        id: statusId,
        userId: user.id,
      },
      data: {
        name: data.name,
        color: data.color,
      },
    });

    return { message: "success", statusId: newStatus.id };
  } catch (e) {
    console.error(e);
    return { message: "error", error: e };
  }
}
export async function createTask(_prevData: any, formData: FormData) {
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

    if (!data.statusId) {
      const defaultStatus = await prisma.status.findFirst({
        where: {
          default: true,
          userId: user.id,
        },
      });
      if (!defaultStatus) {
        return {
          message: "error",
          error: new Error("no default status found"),
        };
      }
      data.statusId = defaultStatus.id;
    }

    const newTask = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        statusId: data.statusId,
        userId: user.id,
      },
    });

    return { message: "success", taskId: newTask.id };
  } catch (e) {
    console.error(e);
    return { message: "error", error: e };
  }
}

export async function updateTask(
  taskId: string,
  _prevData: any,
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

    const newTask = await prisma.task.update({
      where: {
        id: taskId,
        userId: user.id,
      },
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        statusId: data.statusId,
      },
    });

    return { message: "success", taskId: newTask.id };
  } catch (e) {
    console.error(e);
    return { message: "error", error: e };
  }
}

const ProjectSchema = zfd.formData({
  title: zfd.text(z.string()),
  description: zfd.text(z.string()),
});
export async function createProject(_prevData: any, formData: FormData) {
  const { user } = await assertAuth();

  const rawData = Object.fromEntries(formData.entries());

  const { data, success, error } = await ProjectSchema.safeParseAsync(rawData);
  if (!success) {
    return {
      message: "zod error",
      error: z.flattenError(error),
    };
  }

  const newProject = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      userId: user.id,
    },
  });

  return { message: success, projectId: newProject.id };
}

const LoginSchema = zfd.formData({
  email: zfd.text(z.string()),
  password: zfd.text(z.string()),
});
export async function signIn(_prevData: any, formData: FormData) {
  try {
    if (!(await getIPAuth())) {
      return {
        message: "ip not allowed",
        error: new Error("ip not allowed"),
      };
    }

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } = await LoginSchema.safeParseAsync(rawData);

    if (!success) {
      return {
        message: "zod error",
        error: z.flattenError(error),
      };
    }

    await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
        rememberMe: true,
        callbackURL: getBaseURL(),
      },
    });

    return {
      message: "success",
    };
  } catch (e) {
    console.error(e);
    return { message: "error", error: e };
  }
}
