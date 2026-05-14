import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Colors } from "@/lib/utils";

interface DefaultStatusType {
  name: string;
  color: string;
}
const DEFAULT_STATUSES: DefaultStatusType[] = [
  { name: "backlog", color: Colors.blue },
  { name: "in_progress", color: Colors.orange },
  { name: "finished", color: Colors.orange },
];

async function main() {
  try {
    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;
    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "sean",
      },
    });

    DEFAULT_STATUSES.map(async (status) => {
      await prisma.status.create({
        data: status,
      });
    });
  } catch (e) {
    console.error(`seeding error ${e}`);
  } finally {
    console.log("seeding done!");
  }
}

main();
