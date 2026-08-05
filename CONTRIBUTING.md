# Contributing to Atlas

Thanks for your interest in contributing! Atlas is an app that helps students
focus — distraction-free study sessions, built as a fast, modern desktop app.

Everyone participating is expected to follow our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- **Bug fixes, documentation, and minor improvements**: open a pull request
  directly.
- **New features or substantial changes**: please open an issue first so we can
  discuss the approach before you invest time in it.
- **Questions**: use GitHub Discussions or issues — not the issue tracker for
  support requests disguised as bugs.

## Repository layout

Atlas is a Turborepo monorepo (pnpm workspaces):

| Path                | What it is                                             |
| ------------------- | ------------------------------------------------------ |
| `apps/marketing`    | Marketing site (TanStack Start, React 19, Tailwind v4) |
| `apps/api`          | API (AdonisJS v7, Lucid + SQLite, access-tokens auth)  |
| `apps/desktop`      | Desktop app (Tauri 2, React 19, consumes `@atlas/ui`)  |
| `packages/ui`       | Shared shadcn/ui component library                     |
| `packages/*-config` | Shared TypeScript / ESLint presets                     |

Architecture conventions (feature/ui split, API module structure, error
shapes…) are documented in [CLAUDE.md](CLAUDE.md) — please read it before
touching code, PRs that fight the conventions will be asked to adapt.

## Local development

Prerequisites: Node.js ≥ 22, pnpm ≥ 9, and Rust (stable) for the desktop app.

```bash
pnpm install

pnpm dev                                # marketing site on :3000
pnpm --filter @atlas/api dev            # API on :3334
pnpm --filter @atlas/desktop tauri dev  # desktop window (compiles Rust)
```

The API uses a local SQLite file (`apps/api/tmp/`) — run
`node ace migration:run` from `apps/api` on first boot, and copy
`.env.example` to `.env`.

## Checks

Run these before pushing — CI enforces all of them:

```bash
pnpm lint            # ESLint across the workspaces
pnpm check-types     # tsc --noEmit
pnpm format          # Prettier (apps/api has its own preset, run from there)
pnpm --filter @atlas/api test   # japa test suites (stop the API dev server first)
```

New API behavior needs functional specs (`apps/api/tests/functional/`). UI
changes should include a screenshot or short recording in the PR.

## Pull requests

1. Fork the repository and create your branch from `main`.
2. Keep PRs focused: one change per PR — split unrelated fixes.
3. Use conventional commit titles: `feat(scope): description`,
   `fix(scope): description`, `docs: …`, `refactor: …`.
4. Fill in the PR description: what, why, and how it was tested. Link related
   issues. Before/after screenshots for anything visual.
5. Allow maintainer edits on the PR so small fixups don't need round-trips.

We follow the boy scout rule: leave the code cleaner than you found it.
Prettier and ESLint are the source of truth for style — don't argue with them.

## License of contributions

Atlas is licensed under the [GNU AGPL-3.0](LICENSE). By submitting a
contribution, you agree that it is licensed under the same terms, and you
certify that you have the right to submit it.
