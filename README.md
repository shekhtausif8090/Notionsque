# Notionesque

Task management app — list + kanban views, drag-drop, bulk ops, custom fields. Built on Next.js App Router with a Postgres (Neon) backend.

## Features

### Views

- **List View** — table with filters, sorting, pagination
- **Kanban View** — drag-drop between priority columns

### Tasks

- Create / edit / delete (single + bulk)
- Title, description, status, priority
- Arbitrary custom fields (jsonb)
- Detail view modal

### Filtering & sorting

- Filter by status / priority
- Search by title or description
- Sort by any column

### Persistence

- Postgres (Neon) via Drizzle ORM (backend wired)
- Redux + redux-persist on the client (in-flight migration to RTK Query)

## Tech stack

- **Next.js 16** App Router, **React 19**, **TypeScript** strict
- **Redux Toolkit** + **redux-persist**
- **Drizzle ORM** + **`@neondatabase/serverless`** (HTTP driver)
- **Tailwind v4**
- **`@hello-pangea/dnd`** for drag-drop
- **`lucide-react`** icons
- **`zod`** for API validation
- **Radix** `Dialog` / `AlertDialog`

## Getting started

### Prerequisites

- Node.js 20+ (or Bun)
- A Neon Postgres database (or any Postgres) — copy the connection string

### Install

```bash
git clone https://github.com/shekhtausif8090/Notionsque
cd Notionsque
bun install
```

### Environment

Copy `.env.example` → `.env.local` and set:

```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### Database

```bash
bun run db:generate   # emit SQL migration to ./drizzle
bun run db:push       # apply schema directly (dev)
# or
bun run db:migrate    # run committed migrations
```

### Run

```bash
bun run dev
```

Open <http://localhost:3000>.

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Next.js dev server |
| `build` | production build |
| `start` | serve production build |
| `lint` | `next lint` |
| `db:generate` | drizzle-kit generate |
| `db:push` | drizzle-kit push (dev) |
| `db:migrate` | drizzle-kit migrate |
| `db:studio` | drizzle-kit studio |

## Project layout

```
src/
├── app/
│   ├── (views)/{kanban,list}/    # client views
│   └── api/tasks/                # REST route handlers
├── components/{layout,modals,views}/
├── db/{schema,index}.ts          # Drizzle (server-only)
├── features/{tasks,ui}/          # Redux slices
├── lib/
│   ├── api/                      # validators, mappers, response, serialize
│   ├── store.ts, StoreProvider.tsx, hooks.ts
│   └── utils.ts, welcomeTasks.ts
└── types/index.ts
```

Path alias `@/*` → `./src/*` (use it; avoid deep relative imports).

## API

All endpoints under `/api/tasks`:

| Method | Route                           | Purpose                                   |
| ------ | ------------------------------- | ----------------------------------------- |
| GET    | `/api/tasks`                    | list (filter / sort / search)             |
| POST   | `/api/tasks`                    | create (server computes `position`)       |
| GET    | `/api/tasks/[id]`               | fetch one                                 |
| PATCH  | `/api/tasks/[id]`               | update; cross-priority drag w/ index      |
| DELETE | `/api/tasks/[id]`               | delete                                    |
| POST   | `/api/tasks/bulk`               | bulk create                               |
| PATCH  | `/api/tasks/bulk`               | bulk status / priority update             |
| DELETE | `/api/tasks/bulk`               | bulk delete                               |
| PATCH  | `/api/tasks/reorder`            | same-priority reorder (single CASE UPDATE)|
| PATCH  | `/api/tasks/[id]/custom-fields` | set / remove a single jsonb key           |

## Notes

- DB enum values are snake_case (`not_started`, `in_progress`); the TypeScript types use spaces (`"not started"`). Mapping happens at the API boundary in [src/lib/api/mappers.ts](src/lib/api/mappers.ts).
- The Neon HTTP driver does not support multi-statement transactions. Position-touching ops are written as single SQL statements (CTEs, `CASE` UPDATE, `jsonb_set`).
