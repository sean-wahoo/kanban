import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Colors } from "@/lib/utils/shared";

interface DefaultStatusType {
  id: string;
  name: string;
  color: string;
}
const DEFAULT_STATUSES: DefaultStatusType[] = [
  { id: "DEFAULT_BACKLOG", name: "backlog", color: Colors.blue },
  { id: "DEFAULT_IN_PROGRESS", name: "in_progress", color: Colors.orange },
  { id: "DEFAULT_FINISHED", name: "finished", color: Colors.green },
];

async function main() {
  try {
    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;

    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (adminUser) {
      console.log("user already exists");
    } else {
      await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: "sean",
        },
      });

      adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (!adminUser) {
        throw new Error("user not found");
      }
    }

    DEFAULT_STATUSES.map(async (status) => {
      await prisma.status.upsert({
        where: { id: status.id },
        update: {},
        create: { ...status, userId: adminUser.id },
      });
    });
  } catch (e) {
    console.error(`seeding error ${e}`);
  } finally {
    console.log("seeding done!");
  }
}

main();
