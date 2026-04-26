# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # Next.js dev server (port 3000)
bun run build        # production build
bun run start        # serve production build
bun run lint         # next lint (eslint + typescript-eslint)

bun run db:generate  # drizzle-kit generate — emit SQL migration to ./drizzle from current schema
bun run db:push      # drizzle-kit push    — apply schema directly to DB (dev / Neon)
bun run db:migrate   # drizzle-kit migrate — run pending migration files
bun run db:studio    # drizzle-kit studio  — local GUI against DATABASE_URL
```

`DATABASE_URL` (Neon Postgres) must be set in `.env.local`. See `.env.example`.

No test runner is configured.

> Note: [README.md](README.md) is stale — it describes the pre-Next.js Vite era. Trust the code over the README.

## Path alias

`@/*` → `./src/*` (configured in [tsconfig.json](tsconfig.json)). Always use it. Never use deep relative paths like `../../../lib/...`.

## Architecture

### Stack

- Next.js 16 App Router (`src/app/`), React 19, TypeScript strict
- Redux Toolkit + redux-persist (localStorage) for client state
- Drizzle ORM + `@neondatabase/serverless` (HTTP driver) for the database
- Tailwind v4 (PostCSS plugin)
- `@hello-pangea/dnd` for kanban drag-drop
- `lucide-react` for icons (no inline SVGs — replace any you find)
- `zod` for API request validation
- Radix `Dialog`/`AlertDialog` for modals

### State, in transition

The codebase is mid-migration from "fully client-side Redux+localStorage" to "API-backed via Neon". Both halves currently exist:

- **Frontend still dispatches** [tasksSlice](src/features/tasks/tasksSlice.ts) actions (`addTask`, `updateTask`, `deleteTask`, `bulkUpdateTasks`, `reorderTasks`, `updateTaskPriority`). Position math lives inside reducers. Persistence is `redux-persist` → localStorage. Welcome tasks are seeded by `WelcomeTasksSeeder` in [src/lib/StoreProvider.tsx](src/lib/StoreProvider.tsx).
- **Backend is fully wired** under [src/app/api/tasks/](src/app/api/tasks/) — endpoints mirror every slice action (see "API surface" below). Components do **not** call them yet.
- The end state is RTK Query (`tasksApi`) replacing the slice's reducers. UI slice ([src/features/ui/uiSlice.ts](src/features/ui/uiSlice.ts)) stays in Redux.

When implementing a feature, decide whether you're touching the slice (current path) or wiring a new API call (target path). Don't duplicate the same logic in both.

### API surface

All under [src/app/api/tasks/](src/app/api/tasks/):

| Method | Route                           | Notes                                                       |
| ------ | ------------------------------- | ----------------------------------------------------------- |
| GET    | `/api/tasks`                    | filters: status, priority, search, sortBy, sortDir          |
| POST   | `/api/tasks`                    | server computes `position`                                  |
| GET    | `/api/tasks/[id]`               |                                                             |
| PATCH  | `/api/tasks/[id]`               | accepts optional `destinationIndex` for cross-priority drag |
| DELETE | `/api/tasks/[id]`               |                                                             |
| POST   | `/api/tasks/bulk`               | bulk create (welcome seed)                                  |
| PATCH  | `/api/tasks/bulk`               | `{ ids, patch: { status?, priority? } }`                    |
| DELETE | `/api/tasks/bulk`               |                                                             |
| PATCH  | `/api/tasks/reorder`            | `{ priority, orderedIds[] }` — single CASE UPDATE           |
| PATCH  | `/api/tasks/[id]/custom-fields` | `jsonb_set` if value present, `- key` if omitted            |

### Enum boundary (important)

DB enums are snake_case (`task_status`: `not_started | in_progress | completed`). TypeScript types in [src/types/index.ts](src/types/index.ts) use spaces (`"not started"`, `"in progress"`). Always map at the API boundary using [src/lib/api/mappers.ts](src/lib/api/mappers.ts) (`toDbStatus`, `fromDbStatus`). Priority enum values match between DB and TS.

`<select value="not started">` in modals matches the TS form. Don't change the TS form without rewiring every option element.

### Position model

Tasks are ordered within a **priority bucket**. Each row stores an integer `position`. Algorithms:

- **Insert**: `position = COALESCE(MAX(position), -1) + 1` for that priority — done atomically via a single CTE in [POST /api/tasks](src/app/api/tasks/route.ts) and [POST /api/tasks/bulk](src/app/api/tasks/bulk/route.ts).
- **Reorder within bucket**: a single `UPDATE … SET position = CASE WHEN id = $1 THEN 0 …` in [reorder/route.ts](src/app/api/tasks/reorder/route.ts).
- **Cross-priority drag with destination index**: shift `position += 1` where `priority = newPriority AND position >= destinationIndex AND id <> targetId`, then set the moved row to `destinationIndex`. Two SQL statements; in PATCH `[id]` they run sequentially (no transaction — see "Neon HTTP driver" below).
- **Drag-drop in client maps to two endpoints**: same-priority reorder → `PATCH /api/tasks/reorder`; cross-priority drop → `PATCH /api/tasks/[id]` with `priority` + `destinationIndex`.

Gaps after deletes are tolerated; clients sort by `position`.

### Neon HTTP driver constraint

The DB client ([src/db/index.ts](src/db/index.ts)) uses `drizzle-orm/neon-http`. **It does not support multi-statement transactions.** Position-touching ops are written as single statements (CTEs, `CASE` UPDATE, `jsonb_set`) so each statement is atomic in Postgres. If you need multi-statement atomicity, switch to the WebSocket pool driver (`drizzle-orm/neon-serverless`) for that handler.

`db.execute(sql\`…\`)`returns`NeonHttpQueryResult<T>`, **not** an array — read `.rows`. Never destructure directly: `const result = await db.execute(...); const row = result.rows[0]`.

The DB module imports `"server-only"` at the top — accidental client imports fail at build time. Keep that guard intact.

### Folder layout (the parts that matter)

```
src/
├── app/
│   ├── (views)/{kanban,list}/page.tsx   # Client views, share (views)/layout.tsx
│   └── api/tasks/                       # All REST handlers (App Router route handlers)
├── components/{layout,modals,views}/    # Pure UI; views are the kanban / list / detail
├── db/{schema,index}.ts                 # Drizzle schema + client (server-only)
├── features/{tasks,ui}/*Slice.ts        # Redux Toolkit slices
├── lib/
│   ├── api/{validators,mappers,response,serialize}.ts   # API-side helpers
│   ├── store.ts, StoreProvider.tsx, hooks.ts            # Redux wiring
│   └── utils.ts, welcomeTasks.ts
└── types/index.ts                       # Task, TaskStatus, TaskPriority, UI/Sort/Filter types
```

`src/app/api/*` is server-only by virtue of being route handlers. Anything under `src/db/*` is `server-only` by import.

### Conventions

- Markdown links to project files (e.g. `[name](src/path)`) are preferred over backticked filenames in user-facing text.
- Modals use Radix `Dialog`/`AlertDialog`, not bespoke overlays. Action buttons in row contexts use lucide icons (`Pencil`, `Trash2`) with `title` + `aria-label`; primary CTAs keep their text.
- API handlers follow this pattern:
  1. parse params / body (`await ctx.params` for dynamic routes — App Router params are async in Next 15+)
  2. `schema.safeParse` → `apiZodError` on failure
  3. drizzle query
  4. `serializeTask(row)` to convert Date → ISO and DB-enum → TS-enum before returning
  5. `apiOk` / `apiError`
- Custom fields are stored as jsonb (`Record<string, string|number|boolean>`); a dedicated route updates a single key without rewriting the whole map.
