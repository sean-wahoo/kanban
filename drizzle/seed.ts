// import { env } from "@/env.mjs";
import "dotenv/config";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { statuses, user as users } from "@/server/db";
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
  } catch (e) {
    console.error(`seeding error ${e}`);
  } finally {
    console.log("seeding done!");
  }
}

main();
