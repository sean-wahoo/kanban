<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-stack -->
## Project stack notes

- Database: Drizzle ORM over libsql/Turso (no Prisma). Schema lives in
  `src/server/db/schema.ts`, the client in `src/server/db/index.ts`, seed in
  `drizzle/seed.ts`, and config in `drizzle.config.ts` (`dialect: "turso"`).
  The better-auth tables are generated into `auth-schema.ts` at the repo root
  (run `pnpm db:generate` after changing them). Generated migrations live in
  `drizzle/migrations` and are intentionally gitignored.
- UI: Base UI (`@base-ui/react`) powers the dialogs, dropdown and select
  components. Task/project/login dialogs are driven by handle-based context in
  `src/context/`.
<!-- END:project-stack -->
