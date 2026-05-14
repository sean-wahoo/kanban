"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";
import { serverActionProcedure } from "./trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { zfd } from "zod-form-data";
import { env } from "@/env.mjs";
import { assertAuth, getIPAuth } from "@/lib/utils/server";

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

export async function createStatus(
  userId: string,
  _prevData: any,
  formData: FormData,
) {
  try {
    await assertAuth(userId);

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } =
      await CreateStatusSchema.safeParseAsync(rawData);

    console.log({ data, success, error });

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
      },
    });

    console.log({ newStatus });

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
    const { session, user } = await assertAuth();

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } =
      await CreateStatusSchema.safeParseAsync(rawData);

    console.log({ data, success, error });

    if (!success) {
      return {
        message: "zod error",
        error: z.flattenError(error),
      };
    }

    const newStatus = await prisma.status.update({
      where: {
        id: statusId,
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
export async function createTask(
  userId: string,
  _prevData: any,
  formData: FormData,
) {
  try {
    await assertAuth(userId);

    const rawData = Object.fromEntries(formData.entries());

    const { data, success, error } =
      await CreateTaskSchema.safeParseAsync(rawData);

    console.log({ data, success, error });

    if (!success) {
      return {
        message: "zod error",
        error: z.flattenError(error),
      };
    }

    const newTask = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        statusId: data.statusId,
      },
    });

    console.log({ newTask });

    return { message: "success", taskId: newTask.id };
  } catch (e) {
    console.error(e);
    return { message: "error", error: e };
  }
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

    const { token, user } = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
        rememberMe: true,
        // callbackURL
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
function assertAuthed(arg0: string | undefined) {
  throw new Error("Function not implemented.");
}
