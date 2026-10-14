import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  account,
  session,
  twoFactor,
  user,
  verification,
} from "@/../auth-schema";

// // ---------------------------------------------------------------------------
// // better-auth tables (user, session, account, verification, twoFactor)
// // ---------------------------------------------------------------------------
//
// export const users = sqliteTable(
//   "user",
//   {
//     id: text("id").primaryKey(),
//     name: text("name").notNull(),
//     email: text("email").notNull(),
//     emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
//     image: text("image"),
//     createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
//     updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
//
//     // username plugin
//     username: text("username"),
//     displayUsername: text("displayUsername"),
//
//     // twoFactor plugin
//     twoFactorEnabled: integer("twoFactorEnabled", { mode: "boolean" }),
//   },
//   (table) => [
//     uniqueIndex("user_email_unique").on(table.email),
//     uniqueIndex("user_username_unique").on(table.username),
//   ],
// );
//
// export const sessions = sqliteTable(
//   "session",
//   {
//     id: text("id").primaryKey(),
//     expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
//     token: text("token").notNull(),
//     createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
//     updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
//     ipAddress: text("ipAddress"),
//     userAgent: text("userAgent"),
//     userId: text("userId")
//       .notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//   },
//   (table) => [
//     uniqueIndex("session_token_unique").on(table.token),
//     index("session_userId_idx").on(table.userId),
//   ],
// );
//
// export const accounts = sqliteTable(
//   "account",
//   {
//     id: text("id").primaryKey(),
//     accountId: text("accountId").notNull(),
//     providerId: text("providerId").notNull(),
//     userId: text("userId")
//       .notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     accessToken: text("accessToken"),
//     refreshToken: text("refreshToken"),
//     idToken: text("idToken"),
//     accessTokenExpiresAt: integer("accessTokenExpiresAt", {
//       mode: "timestamp",
//     }),
//     refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
//       mode: "timestamp",
//     }),
//     scope: text("scope"),
//     password: text("password"),
//     createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
//     updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
//   },
//   (table) => [index("account_userId_idx").on(table.userId)],
// );
//
// export const verifications = sqliteTable(
//   "verification",
//   {
//     id: text("id").primaryKey(),
//     identifier: text("identifier").notNull(),
//     value: text("value").notNull(),
//     expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
//     createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
//     updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
//   },
//   (table) => [index("verification_identifier_idx").on(table.identifier)],
// );
//
// export const twoFactors = sqliteTable(
//   "twoFactor",
//   {
//     id: text("id").primaryKey(),
//     secret: text("secret").notNull(),
//     backupCodes: text("backupCodes").notNull(),
//     userId: text("userId")
//       .notNull()
//       .references(() => users.id, { onDelete: "cascade" }),
//     verified: integer("verified", { mode: "boolean" }),
//     failedVerificationCount: integer("failedVerificationCount"),
//     lockedUntil: integer("lockedUntil", { mode: "timestamp" }),
//   },
//   (table) => [
//     index("twoFactor_secret_idx").on(table.secret),
//     index("twoFactor_userId_idx").on(table.userId),
//   ],
// );

// ---------------------------------------------------------------------------
// Domain tables
// ---------------------------------------------------------------------------

export const boards = sqliteTable(
  "Board",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    private: integer("private", { mode: "boolean" }).notNull().default(false),
    userId: text("userId").references(() => user.id),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("Board_userId_idx").on(table.userId)],
);

export const projects = sqliteTable(
  "Project",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    userId: text("userId").references(() => user.id),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("Project_userId_idx").on(table.userId)],
);

export const statuses = sqliteTable(
  "Status",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    default: integer("default", { mode: "boolean" }).notNull().default(false),
    color: text("color"),
    order: integer("order").notNull().default(0),
    userId: text("userId").references(() => user.id),
    boardId: text("boardId").references(() => boards.id),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("Status_userId_idx").on(table.userId)],
);

export const tasks = sqliteTable(
  "Task",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    projectId: text("projectId").references(() => projects.id, {
      onDelete: "cascade",
    }),
    statusId: text("statusId").references(() => statuses.id),
    userId: text("userId").references(() => user.id),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("Task_statusId_idx").on(table.statusId),
    index("Task_userId_idx").on(table.userId),
  ],
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type TwoFactor = typeof twoFactor.$inferSelect;
export type Board = typeof boards.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Status = typeof statuses.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export * from "@/../auth-schema";
