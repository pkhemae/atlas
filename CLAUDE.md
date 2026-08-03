# CLAUDE.md - Atlas

This file provides guidance to Claude Code (claude.ai/code) when working with the **Atlas** repository. Atlas is an app that helps students focus: distraction-free study sessions, built as a fast, modern web app.

## Repository layout

Turborepo monorepo (pnpm workspaces):

- `apps/marketing` — TanStack Start marketing site (React 19, Vite, Tailwind CSS v4).
- `apps/api` — `@atlas/api`: AdonisJS v7 API (auth, database). Lucid ORM with SQLite for now, access-tokens auth for the desktop client.
- `apps/desktop` — `@atlas/desktop`: Tauri 2 desktop app (React 19, Vite, Tailwind CSS v4, consumes `@atlas/ui`). Rust backend lives in `src-tauri/`.
- `packages/ui` — `@atlas/ui`: shared shadcn/ui component library, consumed as source (no build step).
- `packages/typescript-config` — `@atlas/typescript-config`: shared tsconfig presets (`base.json`, `react-library.json`).
- `packages/eslint-config` — `@atlas/eslint-config`: shared ESLint flat configs (`base`, `react`).

## Commands

Package manager is **pnpm**. Run from the repo root:

```bash
pnpm install
pnpm dev            # turbo run dev — marketing site on port 3000
pnpm build          # turbo run build
pnpm lint           # turbo run lint (ESLint)
pnpm check-types    # turbo run check-types (tsc --noEmit)
pnpm format         # prettier --write .
pnpm dev --filter @atlas/marketing   # scope any turbo task to one workspace
```

App-specific:

```bash
pnpm --filter @atlas/api dev            # API on port 3334 (node ace serve --hmr)
pnpm --filter @atlas/api test           # japa test suites
pnpm --filter @atlas/desktop tauri dev  # desktop window (compiles Rust, vite on port 1420)
pnpm --filter @atlas/desktop bundle     # native release build (tauri build)
```

### Adding shadcn/ui components

```bash
pnpm dlx shadcn@latest add <component> -c apps/marketing
```

Components land in `packages/ui/src/components/`. Never hand-write low-level UI primitives in the app — add them to `@atlas/ui` via the shadcn CLI and import them from there.

## Architecture & Conventions (Frontend)

### Separation of Concerns (Domain-Driven)

For every page in `src/pages/<domain>/`, we apply a strict Feature/UI split:

1. **Feature (`feature/`)**: Business logic, data fetching (TanStack Query), state management, and side effects.
2. **UI (`ui/`)**: Pure presentational components. No hooks, no fetch. Receives data and callbacks via props.

Example: `src/pages/focus/`

- `feature/focus-session-feature.tsx`: manages timer state, session persistence, and calls `useQuery`/`useMutation`.
- `ui/focus-session.tsx`: receives session data and renders the screen. No hooks or data fetching logic.

### Routing (`src/routes/`)

- TanStack Router (file-based). `routeTree.gen.ts` is generated — never edit it (excluded from lint/format).
- Route files must be thin. They call the Feature component of a page.
- Router context carries the `QueryClient` (see `src/router.tsx`); the root route wires `QueryClientProvider`.

### UI & Styling

- UI primitives come from `@atlas/ui/components/<name>`; the `cn()` helper from `@atlas/ui/lib/utils`.
- Tailwind CSS v4, CSS-first config: theme tokens (colors, radius) live in `packages/ui/src/styles/globals.css`. There is no `tailwind.config` file.
- The app imports `@atlas/ui/globals.css` from `src/styles.css`. The ui package declares `@source` so Tailwind scans its classes — keep those directives when touching the CSS entry points.
- Dark mode via the `.dark` class (`@custom-variant dark`).

### Tech Stack Highlights

- React 19: use `use` and Action patterns for form submissions.
- TanStack Query: all server/async state in `feature/` components.
- TanStack Start: server-side rendering by default; `shellComponent` in `__root.tsx` owns the HTML document.

### Backend Context (`apps/api`)

- AdonisJS v7: controllers in `app/controllers/`, models in `app/models/`, services in `app/services/` (heavy business logic), validators in `app/validators/` (VineJS).
- Database: Lucid ORM, SQLite via better-sqlite3 for now (file in `tmp/`); switching to Postgres later only changes the dialect + connection config.
- Auth: `@adonisjs/auth` — use the access-tokens guard for the desktop client.
- Imports use the `#` subpath aliases defined in `package.json` (`#controllers/*`, `#models/*`, …).
- The api keeps its own Adonis ESLint/Prettier presets (`apps/api` is excluded from the root Prettier); run its lint/format from the workspace.
- Business rule: every focus-session computation (durations, streaks, stats) lives in the API or a dedicated lib — single source of truth.

## Development Guidelines

- **Imports**: use the `@/*` alias for `src/*` inside each app; cross-package imports go through `@atlas/ui/...` exports.
- **Naming**: PascalCase for components, kebab-case for files.
- **Formatting**: Prettier is the source of truth; ESLint (flat config, shared via `@atlas/eslint-config`) for correctness.
- **TypeScript**: pinned to `^5.9`. Do NOT upgrade to TypeScript 7.x — typescript-eslint requires `<6.1.0`.
- **Internal packages**: consumed as source through `exports` maps (no build step in `packages/ui`). Add dependencies to the workspace that uses them, not to the root.
- **Business logic**: any focus-session computation (durations, streaks, stats) must live in a dedicated lib or the future backend — single source of truth, never duplicated across UI components.
