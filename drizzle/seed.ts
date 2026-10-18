// import { env } from "@/env.mjs";
import "dotenv/config";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { projects, statuses, user as users } from "@/server/db";
import { eq } from "drizzle-orm";
import { Colors } from "@/lib/utils/shared";

interface DefaultStatusType {
  id: string;
  name: string;
  color: string;
  default?: boolean;
}
const DEFAULT_STATUSES: DefaultStatusType[] = [
  { id: "DEFAULT_BACKLOG", name: "backlog", default: true, color: Colors.blue },
  { id: "DEFAULT_IN_PROGRESS", name: "in_progress", color: Colors.orange },
  { id: "DEFAULT_FINISHED", name: "finished", color: Colors.green },
];

async function main() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? "sKl5r@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "password";

    let [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

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

      [adminUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, adminEmail))
        .limit(1);

      if (!adminUser) {
        throw new Error("user not found");
      }
    }

    for (const status of DEFAULT_STATUSES) {
      const existing = await db
        .select()
        .from(statuses)
        .where(eq(statuses.id, status.id))
        .limit(1);

      if (!existing[0]) {
        await db.insert(statuses).values({
          id: status.id,
          name: status.name,
          color: status.color,
          default: status.default ?? false,
          userId: adminUser.id,
        });
      }
    }

    const DEMO_LONG_DESCRIPTION_PROJECT = {
      id: "DEMO_LONG_DESCRIPTION",
      title: "dolor sit amet",
      description:
        "consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua — ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat, duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum, sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo",
    };

    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, DEMO_LONG_DESCRIPTION_PROJECT.id))
      .limit(1);

    if (!existingProject[0]) {
      await db.insert(projects).values({
        ...DEMO_LONG_DESCRIPTION_PROJECT,
        userId: adminUser.id,
      });
    }
  } catch (e) {
    console.error(`seeding error ${e}`);
  } finally {
    console.log("seeding done!");
  }
}

main();
