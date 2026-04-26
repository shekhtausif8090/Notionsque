# Full-Stack Implementation Plan

Goal: turn Notionsque into a real full-stack app. Replace redux-persist (localStorage) with Neon/Postgres via the route handlers already scaffolded in [src/app/api/tasks](src/app/api/tasks/).

Prereqs done:
- Drizzle schema + client ([src/db/schema.ts](src/db/schema.ts), [src/db/index.ts](src/db/index.ts))
- Drizzle config + npm scripts
- Empty route handlers returning `501`
- `lucide-react` icons swapped in

---

## 1. Schema fixes (do first)

Existing DB enums are snake_case; existing TS types use spaces. Decide one:

**Option A — keep DB snake_case, map at boundary** (recommended)
- DB stores `not_started`, `in_progress`, `none`, `low`, etc.
- Add a tiny mapper `src/lib/api/mappers.ts`:
  - `toDbStatus("not started") -> "not_started"` and inverse
  - `toDbPriority` is identity (priority enum already matches)
- Apply on every read/write boundary in route handlers.

**Option B — change TS types to snake_case**
- Edit [src/types/index.ts](src/types/index.ts): `"not_started" | "in_progress" | "completed"`.
- Update every `<option value="not started">` in [TaskModal.tsx](src/components/modals/TaskModal.tsx), [BulkEditModal.tsx](src/components/modals/BulkEditModal.tsx).
- Update badge classes / labels in [src/lib/utils.ts](src/lib/utils.ts).
- Update welcome tasks generator [src/utils/welcomeTasks.ts](src/utils/welcomeTasks.ts).
- Risk: bigger blast radius across UI.

Pick **A**. Less churn.

Add two migrations / pushes:
1. `npm run db:generate` from current schema
2. `npm run db:push` against Neon

Add `pgcrypto` extension for `gen_random_uuid()`:
- Drizzle generates this implicitly with `uuid().default(sql\`gen_random_uuid()\`)` on Neon (gen_random_uuid is built-in on Postgres ≥ 13). Verify on first migrate; if missing, prepend `CREATE EXTENSION IF NOT EXISTS pgcrypto;` to migration SQL.

---

## 2. Endpoint logic (per route)

All handlers: parse → validate (zod, optional) → query → map enums → return JSON. Errors → `{ error: string }` with 400/404/500.

### `GET /api/tasks` — [src/app/api/tasks/route.ts](src/app/api/tasks/route.ts)
- Parse query: `status`, `priority`, `search`, `sortBy`, `sortDir`.
- Build `where` with `and(...)`:
  - status filter: `eq(tasks.status, mapped)` (skip if `all`)
  - priority filter: same
  - search: `ilike(tasks.title, '%' + term + '%')` OR `ilike(tasks.description, ...)`
- Order: `[asc/desc](tasks[sortBy])` with default `tasks.position`.
- Return `Task[]` (mapped enums back to TS form).

### `POST /api/tasks` — same file
- Body: `{ title, description?, status?, priority?, customFields? }`.
- Compute `position` server-side: `MAX(position) + 1` for the given priority (transactional, see §3).
- Insert, return inserted row.

### `GET /api/tasks/[id]` — [src/app/api/tasks/[id]/route.ts](src/app/api/tasks/[id]/route.ts)
- `select().from(tasks).where(eq(tasks.id, id)).limit(1)` → 404 if empty.

### `PATCH /api/tasks/[id]` — same file
- Body: partial `Task` fields.
- If `priority` changes, recompute `position` = `MAX(position)+1` for new priority bucket. Apply in same transaction.
- Set `updatedAt = now()`.
- Return updated row.

### `DELETE /api/tasks/[id]` — same file
- `delete().where(eq(tasks.id, id))`.
- Return `{ ok: true }`. Position gaps in old priority bucket OK — clients sort by position, gaps don't affect order.

### `POST /api/tasks/bulk` — [src/app/api/tasks/bulk/route.ts](src/app/api/tasks/bulk/route.ts)
- Body: `{ tasks: NewTask[] }`.
- Single `db.insert(tasks).values([...]).returning()`.
- For each input without `position`, compute per-priority offsets server-side.
- Used by welcome-task seed.

### `PATCH /api/tasks/bulk` — same file
- Body: `{ ids: string[], patch: { status?, priority? } }`.
- If `patch.priority` set: assign new sequential positions starting at `MAX(position)+1` for destination bucket; loop in transaction.
- Else: simple `UPDATE ... WHERE id = ANY(ids)`.
- Return updated rows.

### `DELETE /api/tasks/bulk` — same file
- Body: `{ ids: string[] }`.
- `delete().where(inArray(tasks.id, ids))`.

### `PATCH /api/tasks/reorder` — [src/app/api/tasks/reorder/route.ts](src/app/api/tasks/reorder/route.ts)
- Body: `{ priority: TaskPriority; orderedIds: string[] }`.
- Transaction:
  1. For each `id, idx` in `orderedIds.entries()`: `UPDATE tasks SET position = idx, updatedAt = now() WHERE id = $1 AND priority = $2`.
  2. Use a single `CASE` SQL statement for atomicity:
     ```sql
     UPDATE tasks
     SET position = CASE id
       WHEN $1 THEN 0 WHEN $2 THEN 1 ...
     END,
     updated_at = now()
     WHERE id = ANY($N) AND priority = $P;
     ```
  3. Or use Drizzle `db.transaction(async tx => { for (...) await tx.update(...) })` — simpler, slower.
- Return `{ ok: true }` or the updated list.

### `PATCH /api/tasks/[id]/custom-fields` — [src/app/api/tasks/[id]/custom-fields/route.ts](src/app/api/tasks/[id]/custom-fields/route.ts)
- Body: `{ key: string; value?: string|number|boolean }`.
- Read current row, mutate `customFields` jsonb, write back. (Postgres jsonb path ops possible but more complex; keep simple.)
- Or: single statement using `jsonb_set` / `- key`:
  - Set: `customFields = jsonb_set(customFields, '{key}', to_jsonb($val))`
  - Remove: `customFields = customFields - $key`

---

## 3. Position transactional handling

Concurrent inserts/reorders can collide. Wrap every position-touching op in `db.transaction()`:

- Insert → `SELECT MAX(position) FROM tasks WHERE priority = $p FOR UPDATE` then `INSERT`.
- Reorder → `BEGIN; UPDATE ... ; COMMIT;`.

Neon HTTP driver does **not** support multi-statement transactions. Two paths:
- **Switch to Neon WebSocket driver** for transactional handlers: `import { Pool } from '@neondatabase/serverless'` + `drizzle-orm/neon-serverless`. Wrap in `pool.connect()`.
- Or accept eventual consistency — reorder uses a single `CASE` UPDATE (atomic per-statement); position-on-insert uses a CTE: `INSERT ... SELECT COALESCE(MAX(position),-1)+1 FROM tasks WHERE priority = $p` (single statement, atomic).

Recommend: stick with HTTP driver, use single-statement CTEs for inserts and `CASE` UPDATE for reorders. No transactions needed.

---

## 4. Frontend rewiring

Current Redux slice mutates in-memory. Two strategies:

### Strategy A — RTK Query (recommended)
- Add `src/features/tasks/tasksApi.ts` using `createApi` + `fetchBaseQuery({ baseUrl: '/api' })`.
- Endpoints: `listTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`, `bulkCreate`, `bulkUpdate`, `bulkDelete`, `reorder`, `setCustomField`.
- Tag: `'Tasks'`. Mutations invalidate `'Tasks'`.
- Delete `tasksSlice.ts` reducers (keep types). Delete redux-persist for tasks (keep for ui).
- Delete `WelcomeTasksSeeder` from [StoreProvider.tsx](src/lib/StoreProvider.tsx); replace with server-side seed (see §6).
- Wire components:
  - [KanbanView.tsx](src/components/views/KanbanView.tsx): `useListTasksQuery`, mutations for drag-drop. Optimistic update via RTK Query `onQueryStarted` + `updateQueryData`.
  - [ListView.tsx](src/components/views/ListView.tsx): same query hook.
  - [TaskModal.tsx](src/components/modals/TaskModal.tsx): `useCreateTaskMutation`, `useUpdateTaskMutation`.
  - [BulkEditModal.tsx](src/components/modals/BulkEditModal.tsx): `useBulkUpdateTasksMutation`.
  - [DeleteConfirmModal.tsx](src/components/modals/DeleteConfirmModal.tsx): `useDeleteTaskMutation` / `useBulkDeleteTasksMutation`.

### Strategy B — Server Components + Server Actions
- Convert [src/app/(views)/list/page.tsx](src/app/(views)/list/page.tsx) and kanban to server components. Fetch tasks server-side.
- Use Server Actions for mutations.
- Keep Redux only for UI state (modals, filters, selections).
- Better DX, less client code, but big refactor — current views are deeply client-side with `@hello-pangea/dnd` + state.

Pick **A**. Less rewriting; preserves client-side drag-drop & filtering.

### Loading / error / empty states
- Add skeleton in [ListView.tsx](src/components/views/ListView.tsx) and [KanbanView.tsx](src/components/views/KanbanView.tsx) while `isLoading`.
- Toast on mutation errors (add a tiny `Toaster` or use existing modal pattern).
- Empty state already present.

### Optimistic updates for drag-drop
- Reorder mutation: in `onQueryStarted`, patch `listTasks` cache with new positions before server confirms. Roll back on error.
- Without this, UX feels laggy on drag end.

---

## 5. Validation + errors

- Add `zod` to deps. Fill [src/lib/api/validators.ts](src/lib/api/validators.ts):
  - `taskCreateSchema`, `taskUpdateSchema`, `bulkUpdateSchema`, `reorderSchema`, `customFieldSchema`.
- Each handler: `const parsed = schema.safeParse(body); if (!parsed.success) return 400`.
- Helper `apiError(message, status)` for consistent shape.

---

## 6. Welcome / seed strategy

Two options:
- **Server seed**: SQL script in `drizzle/seed.sql` or `scripts/seed.ts` running `db.insert(tasks).values(welcomeTasks)`. Run once via `tsx scripts/seed.ts` or `npm run db:seed`. Remove `WelcomeTasksSeeder` from client.
- **First-load seed**: client checks `listTasks` empty → calls `POST /api/tasks/bulk`. Race-prone if two clients open at once.

Pick server seed. Add npm script `db:seed`.

---

## 7. Auth (out of scope, prepare for it)

Not required now but planned:
- Add `users` table later: `id`, `email`, `createdAt`.
- Add `userId` FK on `tasks`. Backfill default user on existing rows.
- Plug NextAuth or Clerk middleware → inject `userId` in every query `where`.
- Today: write all queries against the global `tasks` table; refactor later.

---

## 8. Build order

1. Pick enum mapping (Option A).
2. `db:generate` → review SQL → `db:push` to Neon.
3. Add `zod` + write validators.
4. Implement handlers in order:
   1. `GET /api/tasks`
   2. `POST /api/tasks` (CTE for position)
   3. `GET /api/tasks/[id]`
   4. `PATCH /api/tasks/[id]`
   5. `DELETE /api/tasks/[id]`
   6. `DELETE /api/tasks/bulk`
   7. `PATCH /api/tasks/bulk`
   8. `POST /api/tasks/bulk`
   9. `PATCH /api/tasks/reorder` (CASE statement)
   10. `PATCH /api/tasks/[id]/custom-fields`
5. Curl/Thunder-client smoke test each endpoint.
6. Build `tasksApi.ts` (RTK Query).
7. Rewire one consumer (start with [TaskModal.tsx](src/components/modals/TaskModal.tsx) — simplest mutation).
8. Rewire [ListView.tsx](src/components/views/ListView.tsx) (read-only first).
9. Rewire [KanbanView.tsx](src/components/views/KanbanView.tsx) with optimistic reorder.
10. Rewire [BulkEditModal.tsx](src/components/modals/BulkEditModal.tsx) + [DeleteConfirmModal.tsx](src/components/modals/DeleteConfirmModal.tsx).
11. Delete old `tasksSlice` reducers + `WelcomeTasksSeeder`.
12. Add server seed script.
13. Verify in browser: create / edit / delete / drag / bulk / search / sort all hit DB.

---

## 9. Risks / edge cases

- **Neon HTTP cold start** — first request slow. Acceptable for now.
- **Position drift** — gaps after deletes are fine; renumber lazily on next reorder.
- **Concurrent reorders** by same user (multi-tab) — last write wins; acceptable.
- **Custom field types** — current type allows `string|number|boolean`; jsonb stores fine but be careful with `0`/`false`/`""` truthiness in UI.
- **`updatedAt` drift** — always set in handler, ignore client-supplied value.
- **redux-persist migration** — existing users have localStorage tasks. Decide: discard, or one-time push to backend on first load. Discard simplest.

---

## 10. Done definition

- App opens → fetches tasks from Neon (no localStorage).
- Create/edit/delete persist across browsers.
- Drag-drop reorder survives reload.
- Bulk ops work.
- Welcome tasks seeded once on empty DB.
- All routes return non-501 status.
