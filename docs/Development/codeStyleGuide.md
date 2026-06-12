# Gen3 Frontend Framework — Code Style Guide

This guide codifies the conventions observed throughout the monorepo. Follow these rules to keep the codebase consistent
and reviewable.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [TypeScript](#2-typescript)
3. [React Components](#3-react-components)
4. [State Management](#4-state-management)
5. [File and Directory Naming](#5-file-and-directory-naming)
6. [Imports and Exports](#6-imports-and-exports)
7. [Styling](#7-styling)
8. [Error Handling](#8-error-handling)
9. [Testing](#9-testing)
10. [Utilities and Patterns](#10-utilities-and-patterns)
11. [Tooling](#11-tooling)

---

## 1. Project Structure

The repo is a **Lerna + Nx monorepo**. Each package has a single, well-defined responsibility:

| Package                  | Purpose                                                         |
|--------------------------|-----------------------------------------------------------------|
| `packages/core`          | Redux store, RTK Query APIs, hooks, types, and shared utilities |
| `packages/frontend`      | React components and feature UIs                                |
| `packages/sampleCommons` | Next.js reference application (consumes core + frontend)        |
| `packages/storybook`     | Component documentation                                         |
| `packages/tools`         | Build scripts and local dev tools                               |

**Rules:**

- `packages/core` must not import from `packages/frontend`.
- `packages/frontend` may import from `packages/core`.
- `packages/sampleCommons` may import from both.
- Do not add ad-hoc shared code at the repo root; promote it to the appropriate package.

---

## 2. TypeScript

### Compiler Settings

All packages share these core options. Do not override them per-file:

```json
{
  "strict": true,
  "strictNullChecks": true,
  "forceConsistentCasingInFileNames": true,
  "moduleResolution": "bundler",
  "resolveJsonModule": true,
  "declaration": true,
  "declarationMap": true,
  "sourceMap": true
}
```

### Type Guards

Use the shared type guards from `@gen3/core/utils/ts-utils` rather than inline `typeof` checks:

```typescript
// Good
import { isNotDefined, isString, isObject, isArray } from '@gen3/core';

if (isNotDefined(value)) return;

// Avoid
if (value === undefined || value === null) return;
```

Define new type guards as predicate functions:

```typescript
export const isFoo = (x: unknown): x is Foo =>
  isObject(x) && 'fooProperty' in x;
```

### Discriminated Unions

Prefer discriminated unions over optional properties for variant types:

```typescript
// Good
type Action =
  | { type: 'ADD'; payload: Item }
  | { type: 'REMOVE'; id: string };

// Avoid
type Action = {
  type: 'ADD' | 'REMOVE';
  payload?: Item;
  id?: string;
};
```

### Avoid `any`

Use `unknown` when a type is truly unknown, then narrow with type guards. Reserve `any` only for third-party interop
where no better type exists, and add a comment explaining why.

---

## 3. React Components

### Functional Components Only

All components are functional. Never use class components.

```typescript
// Good
const MyComponent: React.FunctionComponent<MyProps> = ({
                                                         label,
                                                         onClick,
                                                       }: MyProps): ReactElement => <button onClick = { onClick } > { label } < /button>;

export default MyComponent;
```

### Props Interface

- Define a named interface for every component's props.
- Place the interface in the same file directly above the component.
- Extend `Record<string, unknown>` when the component is designed to be used as a plugin/renderer target.

```typescript
interface MyComponentProps {
  label: string;
  onClick?: () => void;
  children?: ReactNode;
}

// Plugin components that participate in a factory:
export interface DetailsPanelComponentProps extends Record<string, unknown> {
  id?: string;
  onClose?: (id?: string) => void;
}
```

### Return Type Annotation

Always annotate the return type as `ReactElement` (or `ReactNode` when `null` is a valid return):

```typescript
const MyComponent = ({ label }: MyProps): ReactElement => <span>{ label } < /span>;
```

### Default Props via Destructuring

Set defaults inline in the destructuring signature, not via `defaultProps`:

```typescript
const Card = ({
                size = 'lg',
                color = 'utility.5',
                width = 'w-1/2',
              }: CardProps): ReactElement => { ...
};
```

### Hooks

- Custom hooks live in their own files prefixed with `use` (e.g., `useDataLibrary.ts`).
- Hooks that access the Redux store use the typed wrappers:

```typescript
import { useCoreSelector, useCoreDispatch } from '@gen3/core';

const value = useCoreSelector(selectSomething);
const dispatch = useCoreDispatch();
```

---

## 4. State Management

### Redux Toolkit (RTK)

All global state is managed with Redux Toolkit. Do not introduce other global state libraries.

**Slice pattern:**

```typescript
const mySlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    doSomething: (state, action: PayloadAction<SomeType>) => {
      // Immer-safe mutation
      state.value = action.payload;
    },
  },
});

export const { doSomething } = mySlice.actions;
export default mySlice.reducer;
```

**Entity adapters** for collections:

```typescript
export const itemsAdapter = createEntityAdapter<Item, ItemId>({
  selectId: (item) => item.id,
  sortComparer: (a, b) => b.modifiedDatetime.localeCompare(a.modifiedDatetime),
});
```

### RTK Query

All server data fetching uses RTK Query. Do not use raw `fetch` or `axios` inside components.

```typescript
export const myApi = createApi({
  reducerPath: 'myApi',
  baseQuery: fetchBaseQuery({ baseUrl: GEN3_API }),
  endpoints: (builder) => ({
    getItems: builder.query<Item[], void>({
      query: () => '/items',
    }),
  }),
});

export const { useGetItemsQuery } = myApi;
```

- Inject endpoints into a parent API (e.g., `gen3Api`) using `injectEndpoints` rather than creating standalone APIs.
- Include CSRF headers via `prepareHeaders` in the base query — do not add them manually in components.

### Redux Persist

Only whitelist slices that genuinely need persistence:

```typescript
const persistConfig = {
  key: `${GEN3_COMMONS_NAME}-root`,
  version: 1,
  storage,
  whitelist: ['cohorts', 'activeWorkspace', 'cart'],
};
```

### Local State

Use `useState` for simple local state. Use `useReducer` + `Context` for local state shared across a subtree. Never lift
local-only state into the Redux store.

---

## 5. File and Directory Naming

| Artifact             | Convention                           | Example                      |
|----------------------|--------------------------------------|------------------------------|
| React component file | PascalCase `.tsx`                    | `AnalysisPanel.tsx`          |
| Hook file            | camelCase `use` prefix `.ts`         | `useDataLibrary.ts`          |
| Redux slice          | camelCase `Slice` suffix `.ts`       | `cohortManagerSlice.ts`      |
| Utility / helper     | camelCase `.ts`                      | `calculateLaunchSteps.ts`    |
| Type definitions     | `types.ts` or colocated with feature | `types.ts`                   |
| Constants            | `constants.ts`                       | `constants.ts`               |
| Barrel export        | `index.ts` or `index.tsx`            | `index.ts`                   |
| Unit test            | `.unit.test.ts` / `.unit.test.tsx`   | `cohortManager.unit.test.ts` |
| Integration test     | `.test.ts` / `.test.tsx`             | `api.test.ts`                |

**Directory structure within a feature:**

```
features/
  MyFeature/
    index.ts          # barrel export
    MyFeature.tsx     # main component
    MyFeatureSlice.ts # Redux slice
    MyFeatureApi.ts   # RTK Query endpoints
    types.ts
    constants.ts
    hooks/
      useMyFeature.ts
    components/
      SubComponent.tsx
    tests/
      myFeature.unit.test.ts
```

---

## 6. Imports and Exports

### Barrel Exports

Every feature and component directory exposes its public API through an `index.ts` file. Keep the barrel minimal — only
export what external consumers should use.

```typescript
// packages/frontend/src/components/Buttons/index.ts
export { default as ActionButton } from './ActionButton';
export { Gen3Button, Gen3ButtonReverse } from './Gen3Button';
export * from './DownloadButtons';
```

### Subpath Imports (enforced by ESLint)

Do **not** import from the root barrel of a package when a subpath entrypoint is available:

```typescript
// Good
import { Gen3Button } from '@gen3/frontend/components/Buttons';

// Avoid — imports the entire package barrel
import { Gen3Button } from '@gen3/frontend';
```

### Import Order

Group imports in this order (Prettier + ESLint enforce this automatically):

1. Node built-ins
2. External packages (`react`, `@reduxjs/toolkit`, `@mantine/core`, etc.)
3. Internal monorepo packages (`@gen3/core`, `@gen3/frontend`)
4. Relative imports (`./`, `../`)

Leave a blank line between each group.

### Type-only Imports

Use `import type` for imports used solely as types:

```typescript
import type { ReactElement, ReactNode } from 'react';
import type { MRT_Row } from 'mantine-react-table';
```

---

## 7. Styling

### Tailwind CSS (primary)

Tailwind utility classes are the default styling mechanism. Write classes directly in JSX:

```tsx
<div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white">
  Content
</div>
```

- Never use inline `style` objects for presentational styles; use Tailwind classes.
- Dynamic classes must be complete strings (not string interpolations) so they are included in the Tailwind safelist:

```tsx
// Good — full class name present in source
const colorClass = selected ? 'bg-primary' : 'bg-secondary';

// Avoid — Tailwind cannot statically detect partial strings
const colorClass = `bg-${colorName}`;
// If unavoidable, add the pattern to the tailwind.config.js safelist.
```

### Tailwind Styled Components

For reusable styled primitives, use `tailwind-styled-components`:

```typescript
import tw from 'tailwind-styled-components';

interface ButtonProps {
  $variant: 'primary' | 'secondary';
}

export const StyledButton = tw.button<ButtonProps>`
  inline-block
  rounded
  px-4 py-2
  font-semibold
  ${(p) => p.$variant === 'primary' ? 'bg-primary text-white' : 'bg-secondary text-black'}
`;
```

Use the `$` prefix on transient props to prevent them from being forwarded to the DOM.

### CSS Modules

Use CSS Modules only when Tailwind cannot express the required style (e.g., complex animations, third-party component
overrides). Name the file `ComponentName.module.css`.

### Mantine

Mantine components provide the UI foundation. Use Mantine props for spacing, color, and size before reaching for custom
classes. Use the theme token system (`primary`, `secondary`, `accent`, `utility`) rather than hard-coded hex values.

---

## 8. Error Handling

### Console Logging

Use the appropriate console level and include a bracketed tag identifying the source:

```typescript
// Warning — recoverable, fallback applied
console.warn('[RenderFactory] Renderer not found for type:', type, '— using default.');

// Error — operation failed
console.error(`[MyFeature] Failed to load data: ${error}`);
```

Do not use `console.log` in production code.

### Try-Catch

Catch at the boundary where you can recover or provide a useful fallback. Do not swallow errors silently:

```typescript
try {
  doRiskyThing();
} catch (error) {
  console.error('[MyFeature] doRiskyThing failed:', error);
  return fallbackValue;
}
```

### User-Facing Errors

Render errors to users via the `ErrorCard` / `MessageCard` component family — never raw `alert()` or bare error strings
in JSX:

```tsx
if (isError) {
  return <ErrorCard message="Unable to load data. Please try again." />;
}
```

### Exhaustiveness Checking

When switching on a discriminated union, add an exhaustiveness guard:

```typescript
const handleOperation = (op: Operation): Result => {
  switch (op.operator) {
    case '=':
      return handleEquals(op);
    case 'and':
      return handleIntersection(op);
    case 'or':
      return handleUnion(op);
    default: {
      const _exhaustive: never = op;
      throw new Error(`Unhandled operator: ${JSON.stringify(_exhaustive)}`);
    }
  }
};
```

---

## 9. Testing

### Framework

- **Jest** with **ts-jest** for TypeScript compilation
- **React Testing Library** for component tests
- Test environment is `jsdom` for frontend, `node` for core

### File Location and Naming

Place tests alongside source files or in a `tests/` subdirectory of the feature:

```
features/MyFeature/
  MyFeature.tsx
  tests/
    myFeature.unit.test.ts
```

Suffix unit tests with `.unit.test.ts(x)`.

### Structure

Use `describe` / `test` (not `it`) and nest `describe` blocks by feature area:

```typescript
describe('cohortManagerSlice', () => {
  describe('initial state', () => {
    test('returns default state for unknown actions', () => {
      expect(reducer(undefined, { type: '__UNKNOWN__' })).toEqual(expectedInitialState);
    });
  });

  describe('createNewCohort', () => {
    test('adds a cohort to the collection', () => {
      const state = reducer(initialState, createNewCohort({ name: 'Test' }));
      expect(Object.keys(state.entities)).toHaveLength(1);
    });
  });
});
```

### What to Test

- Pure reducer logic — all edge cases.
- Custom hooks — via `renderHook`.
- Component rendering — critical user-visible states (loading, error, empty, populated).
- Utility functions — all branches.

### What Not to Test

- Implementation details (internal state, private methods).
- Third-party library behavior.
- Styles or class names.

### Mocking

Mock at the module boundary. Prefer `jest.mock()` at the file level over per-test `jest.spyOn()`. Reset mocks between
tests with `jest.restoreAllMocks()` in `afterEach`.

---

## 10. Utilities and Patterns

### Factory Pattern

Plugin components (renderers, detail panels, analysis tools) are registered with a typed factory singleton. Follow the
existing `RenderFactoryTypedInstance` pattern — do not introduce alternative plugin systems.

```typescript
// Obtain the singleton
const factory = DetailsPanelFactory();

// Register a renderer
factory.registerRenderer('myType', 'myFunction', MyRenderer);

// Retrieve and use
const Renderer = factory.getRenderer(type, functionName);
return <Renderer { ...props }
/>;
```

### Operation Handler Pattern

Filter/query operations use the `OperationHandler` interface for exhaustive, type-safe dispatch. Add new operators to
the interface before implementing.

### Constants

Define magic strings and numbers as named constants in `constants.ts`:

```typescript
// Good
export const DEFAULT_PAGE_SIZE = 20;

// Avoid
const items = data.slice(0, 20);
```

### Avoid Premature Abstraction

Do not extract a helper until the same logic appears in three or more places. Three similar lines of code are preferable
to a premature abstraction.

---

## 11. Tooling

### Formatting

Prettier handles all formatting automatically. Configuration is in `.prettierrc`:

- 2-space indentation
- Single quotes
- Trailing commas (ES5)

Run before committing: `npx prettier --write .`
This is enforced in CI — do not disable it.

### Linting

ESLint uses the flat config format (`eslint.config.mjs`). Do not add `// eslint-disable` comments without a comment
explaining why.

Key enforced rules:

- No root barrel imports from `@gen3/frontend` — use subpath entrypoints.
- No `console.log` in committed code.
- Strict TypeScript checks.

Run: `npx eslint .`

### Build

| Package         | Tool    | Command         |
|-----------------|---------|-----------------|
| `core`          | Rollup  | `npm run build` |
| `frontend`      | Rollup  | `npm run build` |
| `sampleCommons` | Next.js | `npm run build` |
| `tools`         | Next.js | `npm run build` |

Build all packages before publishing npm packages.
Run:

```aiignore
npm run build:pkg
```

`
Aliases are defined in `tsconfig.json` and mirrored in `jest.config.ts`.
