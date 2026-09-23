# Next.js App Router Migration Plan

Migration of `@gen3/samplecommons` from the Pages Router to the App Router.
`@gen3/core` and `@gen3/frontend` require **no architectural changes** — RTK Query
slices, the Redux store, and `CoreProvider` stay as-is; only the entry-point
wiring in `sampleCommons` and a single directive in `core` change.

---

## Guiding Decisions

- **No Server Components for feature pages.** All page-level components stay
  client-rendered. Server Components are used only where they are clearly
  beneficial: loading static config (`layout.tsx`, per-page `page.tsx` wrappers).
- **`@gen3/core` is the service layer.** RTK Query remains the sole data-fetching
  mechanism for all Gen3 API calls. No raw `fetch` is introduced in components.
- **Config loading stays server-side.** `loadContent()` and
  `getNavPageLayoutPropsFromConfig()` are pure async file I/O with no browser
  APIs — they run as Server Components and pass config down as props to client
  components, exactly as `getServerSideProps` does today.

---

## Phase 1 — Provider Layer (`@gen3/core` + `@gen3/frontend`)

These are the only changes needed in shared packages.

### 1.1 `packages/core/src/provider.tsx`

Add `'use client'` at the top. The Redux `Provider` and `PersistGate` require
React context, which is client-only in App Router.

```tsx
'use client';

import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { coreStore } from './store';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

const persistor = persistStore(coreStore);

export const CoreProvider: React.FC<Record<string, unknown>> = ({
  children,
}: PropsWithChildren) => (
  <Provider store={coreStore}>
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  </Provider>
);
```

### 1.2 `packages/frontend/src/components/Providers/Gen3Provider.tsx`

Add `'use client'` at the top. Because `CoreProvider` is a client component,
its parent must also be a client component.

No other changes — the JSX tree stays identical.

---

## Phase 2 — App Shell Client Wrapper (`sampleCommons`)

Create a new `Gen3AppShell` client component that owns everything currently
inside `_app.tsx`'s JSX tree. This is the **client boundary** — nothing above
it uses browser APIs or React hooks.

### New file: `packages/sampleCommons/src/app/components/Gen3AppShell.tsx`

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { MantineProvider, mergeThemeOverrides } from '@mantine/core';
import {
  Gen3Provider,
  type RegisteredIcons,
  type SessionConfiguration,
  type TenStringArray,
  type Fonts,
  type AuthorizedRoutesConfig,
  type ModalsConfig,
  createMantineTheme,
  registerDefaultRemoteSupport,
  registerCohortBuilderDefaultPreviewRenderers,
  registerCohortDiscoveryApp,
  registerExplorerDefaultCellRenderers,
  registerMetadataSchemaApp,
  registerIGVApp,
} from '@gen3/frontend';
import { setDRSHostnames } from '@gen3/core';
import { registerCohortTableCustomCellRenderers } from '@/lib/CohortBuilder/CustomCellRenderers';
import { registerCustomExplorerDetailsPanels } from '@/lib/CohortBuilder/FileDetailsPanel';
import drsHostnames from '../../../config/drsHostnames.json';

interface Gen3AppShellProps {
  icons: RegisteredIcons[];
  colors: Record<string, TenStringArray>;
  fonts: Fonts;
  sessionConfig: SessionConfiguration;
  modalsConfig: ModalsConfig;
  protectedRoutes: AuthorizedRoutesConfig;
  children: React.ReactNode;
}

export default function Gen3AppShell({
  icons,
  colors,
  fonts,
  sessionConfig,
  modalsConfig,
  protectedRoutes,
  children,
}: Gen3AppShellProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setDRSHostnames(drsHostnames);
    registerDefaultRemoteSupport();
    registerMetadataSchemaApp();
    registerCohortDiscoveryApp();
    registerIGVApp();
    registerExplorerDefaultCellRenderers();
    registerCohortBuilderDefaultPreviewRenderers();
    registerCohortTableCustomCellRenderers();
    registerCustomExplorerDetailsPanels();
  }, []);

  const mantineTheme = mergeThemeOverrides(createMantineTheme(fonts, colors));

  return (
    <MantineProvider theme={mantineTheme}>
      <Gen3Provider
        icons={icons}
        sessionConfig={sessionConfig}
        modalsConfig={modalsConfig}
        protectedRoutesConfig={protectedRoutes}
      >
        {children}
      </Gen3Provider>
    </MantineProvider>
  );
}
```

---

## Phase 3 — Root Layout (`sampleCommons`)

Replace `_app.tsx` + `_document.tsx` with `app/layout.tsx`. This is a Server
Component — it loads config and passes it to `Gen3AppShell`.

### New file: `packages/sampleCommons/src/app/layout.tsx`

```tsx
import React from 'react';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { loadContent } from '@/lib/content/loadContent';
import Gen3AppShell from './components/Gen3AppShell';

import '@fontsource/montserrat';
import '@fontsource/source-sans-pro/index.css';
import '@fontsource/poppins';
import '../styles/globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { icons, colors, fonts, sessionConfig, modalsConfig, protectedRoutes } =
    await loadContent();

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <link rel="icon" href="/icons/favicon.ico" />
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Gen3AppShell
          icons={icons}
          colors={colors}
          fonts={fonts}
          sessionConfig={sessionConfig}
          modalsConfig={modalsConfig}
          protectedRoutes={protectedRoutes}
        >
          {children}
        </Gen3AppShell>
      </body>
    </html>
  );
}
```

### Delete

- `src/pages/_app.tsx`
- `src/pages/_document.tsx`

---

## Phase 4 — Page Migration

Each page in `src/pages/` becomes a `page.tsx` file in `src/app/`. The
pattern is consistent: a Server Component `page.tsx` loads per-page config
(currently done by `getServerSideProps`) and passes it as props to the
imported feature component.

### Route mapping

| Pages Router | App Router |
|---|---|
| `pages/index.tsx` | `app/page.tsx` |
| `pages/Discovery.tsx` | `app/Discovery/page.tsx` |
| `pages/Discovery/[studyId].tsx` | `app/Discovery/[studyId]/page.tsx` |
| `pages/Explorer.tsx` | `app/Explorer/page.tsx` |
| `pages/Explorer/[configId].tsx` | `app/Explorer/[configId]/page.tsx` |
| `pages/Submission/[projectId].tsx` | `app/Submission/[projectId]/page.tsx` |
| `pages/files/[fileId].tsx` | `app/files/[fileId]/page.tsx` |
| `pages/notebook/[notebook].tsx` | `app/notebook/[notebook]/page.tsx` |
| `pages/staticNotebook/[notebook].tsx` | `app/staticNotebook/[notebook]/page.tsx` |
| `pages/embeddedDashboard/[...page].tsx` | `app/embeddedDashboard/[...page]/page.tsx` |
| `pages/gradio/[gradio].tsx` | `app/gradio/[gradio]/page.tsx` |
| `pages/app/[appName].tsx` | `app/app/[appName]/page.tsx` |
| `pages/admin/Analysis.tsx` | `app/admin/Analysis/page.tsx` |
| `pages/admin/Resources.tsx` | `app/admin/Resources/page.tsx` |
| `pages/study-reg/index.tsx` | `app/study-reg/page.tsx` |
| `pages/study-reg/request-access.tsx` | `app/study-reg/request-access/page.tsx` |
| `pages/vlmd-submission/index.tsx` | `app/vlmd-submission/page.tsx` |
| `pages/vlmd-submission/request-access.tsx` | `app/vlmd-submission/request-access/page.tsx` |
| `pages/403.tsx` | `app/403/page.tsx` (or `not-found.tsx`) |
| `pages/404.tsx` | `app/not-found.tsx` |
| *(remaining flat pages)* | `app/<PageName>/page.tsx` |

### Page conversion pattern

**Before (`pages/Discovery.tsx`):**
```tsx
import DiscoveryPage from '@gen3/frontend/pages/Discovery/DiscoveryPage';
import { DiscoveryPageGetServerSideProps as getServerSideProps } from '@gen3/frontend/pages/Discovery/data';

export default DiscoveryPage;
export { getServerSideProps };
```

**After (`app/Discovery/page.tsx`):**
```tsx
import { DiscoveryPageGetNavProps } from '@gen3/frontend/pages/Discovery/data';
import DiscoveryPage from '@gen3/frontend/pages/Discovery/DiscoveryPage';

export default async function Page() {
  const props = await DiscoveryPageGetNavProps();
  return <DiscoveryPage {...props} />;
}
```

This requires a companion change in `@gen3/frontend` (Phase 5).

### Custom renderer registration

Pages that call `register*` functions at module scope (e.g. `Explorer.tsx`,
`Discovery.tsx`) need those calls moved. Options ranked by preference:

1. Move into `Gen3AppShell`'s `useEffect` if the renderer is globally needed.
2. Move into the feature component's own `useEffect` in `@gen3/frontend` if
   it is feature-local.

---

## Phase 5 — `@gen3/frontend` Page Data Functions

Every `*GetServerSideProps` function in `packages/frontend/src/pages/*/data.ts`
wraps its logic in `GetServerSideProps` from `next/server` and returns
`{ props: { ... } }`. In App Router, Server Components call async functions
directly and receive the data as a plain object.

For each page data file, export a second function (or rename) that returns the
props object directly, without the `GetServerSideProps` wrapper:

```ts
// data.ts — add alongside existing export for backwards compat during transition
export const DiscoveryPageGetNavProps = async (): Promise<NavPageLayoutProps & { discoveryConfig: DiscoveryConfig }> => {
  // same logic as DiscoveryPageGetServerSideProps, minus the { props: { ... } } wrapper
};
```

The existing `GetServerSideProps` exports can be deleted once all pages are
migrated and the Pages Router is removed.

Key files to update:

- `pages/Discovery/data.ts` — `DiscoveryPageGetServerSideProps`
- `pages/Explorer/data.ts` — `ExplorerPageGetServerSideProps`
- `pages/Landing/data.ts` — `LandingPageGetServerSideProps`
- `pages/DataLibrary/data.ts`
- `pages/TabbedCohortBuilder/data.ts`
- `pages/ClinicalDataAnalysis/data.ts`
- `pages/Query/data.ts`
- `lib/common/staticProps.ts` — `getNavPageLayoutPropsFromConfig` (already
  returns a plain object; no wrapper to remove)

---

## Phase 6 — API Routes

Pages Router API routes (`pages/api/`) become Route Handlers (`app/api/`).
Most are thin wrappers that re-export from `@gen3/frontend/server` — the
handler signature changes from `(req: NextApiRequest, res: NextApiResponse)`
to `(request: Request): Response`.

### Route mapping

| Pages Router | App Router |
|---|---|
| `pages/api/auth/sessionToken.ts` | `app/api/auth/sessionToken/route.ts` |
| `pages/api/auth/credentialsLogin.ts` | `app/api/auth/credentialsLogin/route.ts` |
| `pages/api/auth/credentialsLogout.ts` | `app/api/auth/credentialsLogout/route.ts` |
| `pages/api/auth/sessionLogout.ts` | `app/api/auth/sessionLogout/route.ts` |
| `pages/api/auth/analysis/cohortDiscovery/index.ts` | `app/api/auth/analysis/cohortDiscovery/route.ts` |
| `pages/api/discovery/index.ts` | `app/api/discovery/route.ts` |
| `pages/api/workspace-assets/[tier]/[[...path]].ts` | `app/api/workspace-assets/[tier]/[[...path]]/route.ts` |
| `pages/api/workspace/gateway/[...action].ts` | `app/api/workspace/gateway/[...action]/route.ts` |
| `pages/api/workspace/hatchery/[...action].ts` | `app/api/workspace/hatchery/[...action]/route.ts` |
| `pages/api/workspace/kernel/[...action].ts` | `app/api/workspace/kernel/[...action]/route.ts` |

Each re-exported handler in `@gen3/frontend/server` will need a parallel
`app/` compatible export that returns a Web API `Response`. This is the most
likely source of cross-package breakage and should be done early with tests.

---

## Phase 7 — `next.config` Updates

The existing `next.config.js` is largely compatible. Required changes:

1. **Remove `pageExtensions`** entry for `pages/` if keeping App Router only,
   or keep it if running both routers in parallel during migration.
2. **`output: 'standalone'`** — compatible, no change needed.
3. **`basePath`** — compatible, no change needed.
4. **`rewrites`** — compatible, no change needed.
5. **`withJupyterWorkspaces`** wrapper — verify it does not inject
   Pages Router middleware that conflicts; check `@gen3/workspaces/server`
   exports for App Router compatibility.
6. Rename to `next.config.ts` (optional, but aligns with TypeScript-first
   conventions used elsewhere in the monorepo).

---

## Phase 8 — Cleanup

Once all routes are migrated and verified:

- Delete `src/pages/` directory entirely.
- Delete Pages Router data functions (`GetServerSideProps` variants) from
  `@gen3/frontend/src/pages/*/data.ts`.
- Remove `next/app` and `next/document` imports from any remaining files.
- Remove `whyDidYouRender` and `axe` dev-only bootstrapping from `_app.tsx`
  (move axe to a dev-only layout or drop if covered by other tooling).

---

## Migration Order (Recommended)

1. **Phase 1** — `CoreProvider` + `Gen3Provider` directives. Small, low-risk,
   unblocks everything else.
2. **Phase 5** — Unwrap `GetServerSideProps` data functions in `@gen3/frontend`.
   Do this before page migration so the new page files have something to call.
3. **Phase 2 + 3** — `Gen3AppShell` and `layout.tsx`. Can be developed in
   parallel with Pages Router (`src/pages/` still present) — Next.js supports
   both routers simultaneously during transition.
4. **Phase 4** — Migrate pages one route at a time, verifying each before
   proceeding. Start with the simplest flat pages (no dynamic segments, no
   custom renderers) before tackling dynamic routes.
5. **Phase 6** — API routes. Migrate alongside or after the pages they serve.
6. **Phase 7** — Config cleanup.
7. **Phase 8** — Delete Pages Router files only after all routes pass smoke testing.

---

## Known Risks

| Risk | Mitigation |
|---|---|
| `@gen3/workspaces/server`'s `withJupyterWorkspaces` may inject Pages Router middleware | Audit the plugin; may need an App Router-compatible variant |
| `whyDidYouRender` patches React at module scope — may break in App Router | Move to a dev-only Client Component wrapper or remove |
| `axe-core/react` requires a DOM — safe only in Client Components | Move to a `'use client'` dev layout |
| `PersistGate` with `loading={null}` may cause hydration flash | Acceptable; same behavior as today |
| `getServerSideProps` runs per-request; `page.tsx` Server Components are also per-request by default, but can be accidentally cached | Ensure no `export const revalidate` or `cache()` is added to config-loading pages |
