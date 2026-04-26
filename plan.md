# Backend Plan — Notionsque

Stack: Next.js 16 App Router + PostgreSQL (Neon) + Drizzle ORM.
Scope: scaffold schema, db client, and all REST endpoints with empty handlers. Logic filled in later.

Current state: client-only Redux + redux-persist (localStorage). Single `Task` entity. No auth.

---

## 1. Dependencies

Runtime:

- `drizzle-orm`
- `@neondatabase/serverless`

Dev:

- `drizzle-kit`
- `dotenv` (optional)

Optional later:

- `zod` for request validation

---

## 2. Environment

- `.env.local` → `DATABASE_URL=postgresql://<neon-connection-string>`
- `.env.example` committed with placeholder.

---

## 3. New Files

### `src/db/schema.ts` — Drizzle schema

`tasks` table mirrors [Task](src/types/index.ts):

| Column       | Type                                              | Notes                           |
| ------------ | ------------------------------------------------- | ------------------------------- |
| id           | uuid                                              | PK, default `gen_random_uuid()` |
| title        | text                                              | not null                        |
| description  | text                                              | default `''`                    |
| status       | pgEnum(`not_started`, `in_progress`, `completed`) | default `not_started`           |
| priority     | pgEnum(`none`, `low`, `medium`, `high`, `urgent`) | default `none`                  |
| position     | integer                                           | not null                        |
| customFields | jsonb                                             | default `{}`                    |
| createdAt    | timestamp                                         | default now()                   |
| updatedAt    | timestamp                                         | default now()                   |

Export inferred `Task`, `NewTask` types.

### `src/db/index.ts` — Drizzle client

- Neon HTTP driver + `drizzle(neon(process.env.DATABASE_URL!))`
- Export singleton `db`.

### `drizzle.config.ts`

- `schema: './src/db/schema.ts'`
- `out: './drizzle'`
- `dialect: 'postgresql'`
- `dbCredentials.url: process.env.DATABASE_URL`

### `src/lib/api/validators.ts` (optional)

Zod stubs per endpoint — empty for now.

---

## 4. API Routes (App Router handlers, empty bodies)

| Method | Route                           | Purpose                                                           | Slice action mapped                      |
| ------ | ------------------------------- | ----------------------------------------------------------------- | ---------------------------------------- |
| GET    | `/api/tasks`                    | list (query: `status`, `priority`, `search`, `sortBy`, `sortDir`) | initial load                             |
| POST   | `/api/tasks`                    | create                                                            | `addTask`                                |
| GET    | `/api/tasks/[id]`               | fetch one                                                         | detail view                              |
| PATCH  | `/api/tasks/[id]`               | partial update                                                    | `updateTask`                             |
| DELETE | `/api/tasks/[id]`               | delete one                                                        | `deleteTask`                             |
| POST   | `/api/tasks/bulk`               | bulk create                                                       | seed/import                              |
| PATCH  | `/api/tasks/bulk`               | bulk update `{ ids[], patch }`                                    | `bulkUpdateStatus`, `bulkUpdatePriority` |
| DELETE | `/api/tasks/bulk`               | bulk delete `{ ids[] }`                                           | `bulkDeleteTasks`                        |
| PATCH  | `/api/tasks/reorder`            | reorder `[{ id, position, priority }]`                            | `reorderTasks`                           |
| PATCH  | `/api/tasks/[id]/custom-fields` | set/remove single custom field key                                | custom field reducers                    |

### File layout

```
src/app/api/
├── tasks/
│   ├── route.ts                        GET, POST
│   ├── bulk/
│   │   └── route.ts                    POST, PATCH, DELETE
│   ├── reorder/
│   │   └── route.ts                    PATCH
│   └── [id]/
│       ├── route.ts                    GET, PATCH, DELETE
│       └── custom-fields/
│           └── route.ts                PATCH
```

Each handler:

- Typed `Request` / `NextRequest` signature.
- Parse params + body.
- `// TODO: implement` body.
- Return `NextResponse.json({}, { status: 501 })` placeholder.

---

## 5. Migration Workflow

npm scripts in [package.json](package.json):

- `db:generate` → `drizzle-kit generate`
- `db:migrate` → `drizzle-kit migrate`
- `db:push` → `drizzle-kit push` (dev only)
- `db:studio` → `drizzle-kit studio`

Generated SQL lives in `./drizzle`.

---

## 6. Out of Scope (later phases)

- Auth + `userId` FK on `tasks` (no user model exists today).
- Replace redux-persist with API thunks / RTK Query.
- Welcome-tasks seed → move to SQL seed script.
- Rate limiting, caching headers.
- Zod validation bodies (stubs only for now).

---

## 7. Build Order

1. Install deps + add scripts.
2. Add `.env.example`, `drizzle.config.ts`.
3. Write `src/db/schema.ts` + `src/db/index.ts`.
4. `db:generate` → first migration.
5. Scaffold all route handlers (empty).
6. Hand off to user for logic implementation.
