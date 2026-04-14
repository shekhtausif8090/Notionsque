# React to Next.js Migration Plan — Notionesque

## Current Stack

| Aspect          | Current Setup                                |
| --------------- | -------------------------------------------- |
| **Framework**   | React 19 + Vite 6.2                          |
| **Language**    | TypeScript (strict mode)                     |
| **State**       | Redux Toolkit + redux-persist (localStorage) |
| **Styling**     | Tailwind CSS v4 (Vite plugin)                |
| **Routing**     | None (single page, view toggling via Redux)  |
| **API/Backend** | None (all client-side)                       |
| **Auth**        | None                                         |
| **DnD**         | @hello-pangea/dnd (Kanban board)             |
| **Components**  | ~8 components, ~18 source files total        |

## Target Stack

| Aspect          | Target Setup                             |
| --------------- | ---------------------------------------- |
| **Framework**   | Next.js 16.2.3 (App Router)              |
| **Language**    | TypeScript (strict mode)                 |
| **State**       | Redux Toolkit + redux-persist (SSR-safe) |
| **Styling**     | Tailwind CSS v4.2.2 (PostCSS plugin)     |
| **Routing**     | App Router: `/list`, `/kanban`           |
| **API/Backend** | Structured for future backend            |
| **Auth**        | None (can add later via NextAuth, etc.)  |
| **DnD**         | @hello-pangea/dnd (Client Component)     |

---

## Architecture (After Migration)

```
Notionsque/
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs           # For Tailwind v4
├── public/
│   └── favicon.svg
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── globals.css          # Tailwind imports + global styles
│   │   ├── layout.tsx           # Root layout (Redux Provider, PersistGate)
│   │   ├── page.tsx             # Home → redirect to /list
│   │   ├── list/
│   │   │   └── page.tsx         # ListView route
│   │   └── kanban/
│   │       └── page.tsx         # KanbanView route
│   ├── components/              # Stays largely the same
│   │   ├── layout/
│   │   │   └── Header.tsx       # Updated: uses next/link + usePathname
│   │   ├── modals/
│   │   │   ├── BulkEditModal.tsx
│   │   │   ├── DeleteConfirmModal.tsx
│   │   │   └── TaskModal.tsx
│   │   ├── task/
│   │   │   └── TaskDetailView.tsx
│   │   └── views/
│   │       ├── KanbanView.tsx
│   │       └── ListView.tsx
│   ├── features/                # Redux slices (unchanged)
│   │   ├── tasks/tasksSlice.ts
│   │   └── ui/uiSlice.ts
│   ├── lib/                     # Shared utilities
│   │   ├── store.ts             # Moved from src/app/
│   │   ├── hooks.ts             # Moved from src/app/
│   │   ├── StoreProvider.tsx    # Client Component wrapper
│   │   └── utils.ts             # Extracted shared functions
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── welcomeTasks.ts
```

---

## Key Architecture Decisions

### 1. Redux Store in App Router

- Store created per-request (not module-level singleton) to avoid sharing state between users
- Wrapped in a Client Component (`StoreProvider.tsx`) since Redux hooks are client-only
- `redux-persist` + `PersistGate` stays inside the Client Component boundary

### 2. Routing replaces Redux viewMode

- Replace `viewMode` Redux state with actual Next.js routes (`/list`, `/kanban`)
- `Header.tsx` uses `<Link>` from `next/link` + `usePathname()` instead of dispatching Redux actions
- Remove `viewMode` / `setViewMode` from `uiSlice.ts`
- Home route (`/`) redirects to `/list`

### 3. "use client" Directive

- Every component using Redux hooks, `@hello-pangea/dnd`, or browser APIs needs `"use client"`
- Initially ALL components will be Client Components
- Can optimize later by extracting Server Component shells

### 4. File Moves (src/app/ conflict)

- `src/app/store.ts` and `src/app/hooks.ts` must move to `src/lib/` since Next.js owns `src/app/`

### 5. Backend-Ready Structure

- Keep Redux slices structured so actions can later be replaced with API calls / Server Actions
- `src/lib/` directory convention for shared server/client utilities
- Next.js API routes (`src/app/api/`) can be added later without restructuring

---

## Risk Areas

| Risk                             | Impact                                                          | Mitigation                                                                                                |
| -------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| redux-persist hydration mismatch | Server renders empty, client has localStorage → hydration error | Wrap `PersistGate` with `loading={null}` in Client Component; use `dynamic()` with `ssr: false` if needed |
| @hello-pangea/dnd SSR            | DnD library accesses `window`/`document` on import              | Ensure `KanbanView.tsx` is `"use client"`; use `dynamic()` import if it errors during SSR                 |
| Tailwind v4 + Next.js            | `@tailwindcss/postcss` less tested with Next.js than v3         | Test early in Phase 1; fallback: downgrade to v3                                                          |
| `src/app/` directory conflict    | Next.js owns `src/app/` for routing                             | Move `store.ts` and `hooks.ts` to `src/lib/` before creating routes                                       |

---

## Files Summary

**New files (8):**

- `next.config.ts`
- `postcss.config.mjs`
- `src/lib/StoreProvider.tsx`
- `src/lib/utils.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/list/page.tsx`
- `src/app/kanban/page.tsx`

**Deleted files (7):**

- `vite.config.ts`
- `index.html`
- `tsconfig.node.json`
- `src/vite-env.d.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/app/clearHistoryMiddleware.ts`

**Moved files (2):**

- `src/app/store.ts` → `src/lib/store.ts`
- `src/app/hooks.ts` → `src/lib/hooks.ts`

---

## Migration Checklist

### Phase 0: Pre-Migration Cleanup

- [x] Remove junk dependencies (`install`, `npm`) from package.json
- [x] Extract duplicated utils (`getStatusBadgeClass`, `getPriorityBadgeClass`, `formatDate`) into `src/lib/utils.ts`
- [x] Remove unused `src/components/Pagination.tsx`
- [x] Remove empty `src/app/clearHistoryMiddleware.ts`
- [x] Fix `selectAllTasks` typing (`state: any`) in `tasksSlice.ts`

### Phase 1: Project Setup — Initialize Next.js

- [x] Install dependencies: `next`, `@types/node`, `@tailwindcss/postcss`
- [x] Remove Vite dependencies: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`
- [x] Create `next.config.ts`
- [x] Create `postcss.config.mjs` for Tailwind v4
- [x] Update `tsconfig.json` for Next.js
- [x] Delete `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/vite-env.d.ts`
- [x] Update `package.json` scripts (`dev` → `next dev`, `build` → `next build`, etc.)
- [x] Update `.gitignore` (add `.next/`)

### Phase 2: App Router Structure

- [x] Move `src/app/store.ts` → `src/lib/store.ts`
- [x] Move `src/app/hooks.ts` → `src/lib/hooks.ts`
- [x] Update all imports referencing old `app/store` and `app/hooks` paths
- [x] Create `src/lib/StoreProvider.tsx` (Client Component: `Provider` + `PersistGate`)
- [x] Create `src/app/layout.tsx` (root layout with metadata + StoreProvider)
- [x] Create `src/app/page.tsx` (redirect to `/list`)
- [x] Create `src/app/list/page.tsx` (Header + ListView + modals)
- [x] Create `src/app/kanban/page.tsx` (Header + KanbanView + modals)
- [x] Delete `src/main.tsx` and `src/App.tsx`

### Phase 3: Component Updates

- [x] Add `"use client"` directive to ALL components
- [x] Update `Header.tsx`: replace viewMode toggle with `next/link` + `usePathname`
- [x] Remove `viewMode` state/action/selector from `uiSlice.ts`
- [x] Update all component imports to use `src/lib/` paths
- [x] Move welcome-tasks seeding logic into `StoreProvider`

### Phase 4: Styling Migration

- [x] Move/rename `index.css` → `src/app/globals.css`
- [x] Import `globals.css` in `src/app/layout.tsx`
- [ ] Verify all Tailwind classes render correctly (manual testing)

### Phase 5: Testing & Verification

- [x] Run `next build` — verify production build succeeds (0 errors)
- [ ] Test `/list` route (sort, filter, search, pagination, bulk select)
- [ ] Test `/kanban` route (drag-and-drop working)
- [ ] Test navigation between views via Header links
- [ ] Test task CRUD (create, edit, delete)
- [ ] Test task detail view overlay
- [ ] Test bulk edit and delete confirmation modals
- [ ] Test redux-persist (refresh → tasks survive reload)
- [ ] Test welcome tasks seeding (clear localStorage → reload → seeds appear)
- [ ] Check for hydration errors in browser console

### Phase 6: ESLint & Config Cleanup

- [x] Install `eslint-config-next` and update `eslint.config.js`
- [ ] Run linter and fix warnings
