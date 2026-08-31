# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Gen3 Frontend Framework (GFF) is an npm workspace monorepo managed by Lerna v10 and Nx v23. It publishes shared React
component libraries and a Next.js reference application for the Gen3 data commons platform.

## Commands

### Prerequisites

`@gen3/toolsff` must be built before any dev server starts. The `predev` hooks enforce this:

```bash
npm run build:tools
```

### Development

```bash
npm run dev           # Start all dev servers
npm run dev:app       # sampleCommons only (Next.js at port 3000)
npm run dev:full      # build:tools + build core/frontend + dev:app
```

### Build

```bash
npm run build         # Build all packages (Lerna + Nx)
npm run build:pkg     # Build all except sampleCommons
npm run compile       # TypeScript compile all packages
```

### Lint

```bash
npm run lint          # oxlint --quiet .
npm run lint-fix      # oxlint . --fix
```

### Tests

```bash
npm run test          # Unit tests across all workspaces
npm run test:int      # Integration tests
npm run test:all      # Unit + integration
```

**Single test (from within a package dir):**

```bash
# From packages/core or packages/frontend:
jest unit --testPathPattern="myFile"
jest unit --testNamePattern="my test name"

# @gen3/frontend requires the vm-modules flag:
cd packages/frontend
NODE_OPTIONS=--experimental-vm-modules jest unit --testPathPattern="date"
```

Test file naming: `*.unit.test.ts(x)` for unit tests, `*.int.test.ts` for integration. Tests live alongside source or in
a `tests/` subdirectory.

## Architecture

### Package Dependency Order

```
@gen3/toolsff       → no gen3 deps — build-time CLI tools only
       ↓
@gen3/core          → Redux store, RTK Query API slices, types, hooks
       ↓
@gen3/frontend      → React components and feature UIs
       ↓
@gen3/workspaces    → JupyterLite workspace UI components
       ↓
@gen3/samplecommons → Next.js reference app (not published)
@gen3/storybook     → Storybook 10 for component docs (not published)
```

**`@gen3/core` must never import from `@gen3/frontend`.**

### `@gen3/core` (`packages/core/`)

Redux store (`setupCoreStore`), all RTK Query API slices, and data model types. Features cover: authz, cart, cohort,
config, dataLibrary, download, facets, fence, guppy, metadata, user, workspace, and more. Persisted slices: `cohorts`,
`activeWorkspace`, `cart`, `workspaceKernels`, `tieredWorkspace`. Exports `"."`, `"./server"`, and
`"./exports/constants"` in both CJS and ESM.

### `@gen3/frontend` (`packages/frontend/`)

All user-facing React components and page-level features. Components under `src/components/`; feature UIs under
`src/features/` (CohortBuilder, Discovery, DataLibrary, Navigation, Workspace, etc.); pre-built pages under
`src/pages/`. Exports `"."`, `"./server"`, `"./pages"`, and `"./dist/styles.css"`.

### `@gen3/samplecommons` (`packages/sampleCommons/`)

Private Next.js app. Config-driven via JSON files in `config/$GEN3_COMMONS_NAME/` — one file per page/feature (e.g.,
`discovery.json`, `explorer.json`). Multiple commons configs are present (gen3, brh, heal, midrc, etc.). References
sibling packages as `file:../core`, `file:../frontend`, etc.

### `@gen3/toolsff` (`packages/tools/`)

Build-time CLI tools: `buildColors`, `bundleIcons`, `getSchema`, `scanSitePaths`, and others. Must be built
(`npm run build:tools`) before the dev server starts.

### `@gen3/workspaces` (`packages/workspaces/`)

JupyterLite workspace UI — components, hooks, API layer, and auth integration for the Workspace feature.

## Tech Stack

| Concern        | Choice                                    |
|----------------|-------------------------------------------|
| Monorepo       | npm workspaces + Lerna v10 + Nx v23       |
| Language       | TypeScript 5 (strict mode)                |
| App framework  | Next.js 16                                |
| UI             | Mantine v9 + Tailwind CSS 3               |
| State          | Redux Toolkit + RTK Query + redux-persist |
| Bundler (libs) | Rollup 4 + SWC                            |
| Testing        | Jest 30 + ts-jest + React Testing Library |
| Linter         | **oxlint** (not ESLint)                   |
| Formatter      | Prettier 3                                |
| Node           | >= 24.18.0 (enforced, see `.nvmrc`)       |

## Code Conventions

- Functional components only; annotate return type as `ReactElement`.
- Use `useCoreSelector` / `useCoreDispatch` typed wrappers, not raw `useSelector`/`useDispatch`.
- All server data fetching via RTK Query — no raw `fetch`/`axios` in components.
- Tailwind CSS first; Mantine for UI foundation; CSS Modules only as a last resort.
- `import type` for type-only imports.
- Barrel exports via `index.ts` or `callback.ts` in each feature/component directory.
- `console.warn` / `console.error` only — no `console.log` in production code.
- Use `ErrorCard`/`MessageCard` components for user-facing errors, not `alert()`.
- Type guards from `@gen3/core/utils/ts-utils`.

## Environment

Key env vars for `packages/sampleCommons`:

- `GEN3_COMMONS_NAME` — selects config subdirectory (default: `gen3`)
- `NEXT_PUBLIC_GEN3_API_TARGET` — remote Gen3 backend URL (set in `.env.development.local`)
- `NODE_EXTRA_CA_CERTS` — path to local CA cert for self-signed certs (mkcert)

## CI

GitHub Actions (`.github/workflows/ci.yaml`) runs on Node 24.18.0: `npm ci --include=optional` → `npm run build` →
`npm run lint`.

Pre-commit hooks block commits to `develop`, `main`, and `release/*` branches and run secrets scanning and oxlint.
