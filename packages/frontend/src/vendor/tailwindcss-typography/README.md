# Vendored `@tailwindcss/typography`

This is a local, ESM copy of [`@tailwindcss/typography@0.5.20`](https://github.com/tailwindlabs/tailwindcss-typography)
(MIT, Tailwind Labs Inc. — see `./LICENSE`). Only the module format was changed (CJS → ESM); the plugin logic is
unchanged.

## Why it's vendored

`@tailwindcss/typography` hard-pins `postcss-selector-parser` to an exact `6.0.10`, which is vulnerable to
**CVE-2026-9358** (uncontrolled recursion / DoS in `toString`, fixed in `6.1.3` / `7.1.2`).

Because npm `overrides` are only honored in the **install root**, a published library (`@gen3/frontend`) cannot force a
fixed transitive version onto its consumers — every downstream app would inherit `6.0.10` and have to add its own
override. Vendoring the plugin removes `@tailwindcss/typography` from `@gen3/frontend`'s dependency graph entirely and
lets us depend on `postcss-selector-parser@^6.1.4` directly, so the fix travels with the package and consumers need no
action.

## How it's wired

- `index.js` — the plugin, `export default plugin.withOptions(...)`.
- `utils.js` — imports `postcss-selector-parser` (resolved via `@gen3/frontend`'s own
  `^6.1.4` dependency).
- `styles.js` — the default prose theme data; imports `tailwindcss/colors`.
- `index.d.ts` — `any` type stub (the plugin is only used inside a Tailwind `plugins` array).
- Consumed by `src/utils/tailwindConfig.ts` via `import typography from '../vendor/tailwindcss-typography/index.js'`.
- `rollup.config.mjs` keeps `postcss-selector-parser` and `tailwindcss/colors` **external**
  so they resolve at the consumer's build; the plugin code itself is bundled into `dist`.

## Maintenance / freeze risk

This is a frozen copy — it will **not** receive upstream fixes automatically. If Tailwind Labs ships a typography
update, re-vendor it (re-run the CJS→ESM conversion) or reassess (see below).

## Tailwind v4 migration guidance

The vendored 0.5.20 code **supports Tailwind v4** — 0.5.20's peer range is
`tailwindcss: ">=3.0.0 || >=4.0.0 || insiders"`, and the imports it uses (`tailwindcss/plugin`, `tailwindcss/colors`)
still exist in v4.

In v4, plugins load from CSS rather than a JS `plugins: []` array. Because `index.js`
default-exports a plugin, it drops straight into v4's `@plugin` directive pointed at a local file:

```css
@import "tailwindcss";

@plugin "./path/to/vendor/tailwindcss-typography/index.js";
/* options: @plugin "./index.js" { className: wysiwyg; } */
```

**When migrating to v4, re-evaluate whether to keep vendoring:**

- Check the then-current `@tailwindcss/typography` `postcss-selector-parser` pin
  (`npm view @tailwindcss/typography dependencies`).
- **If it has been bumped to a non-vulnerable range** (≥ `6.1.3` or ≥ `7.1.2`): delete this directory, drop the direct
  `postcss-selector-parser` dependency, and load the real plugin with `@plugin "@tailwindcss/typography";`. Snyk stays
  clean at the source with no vendoring to maintain.
- **If it still pins the vulnerable version**: keep this vendored copy and load it via
  `@plugin "./index.js"`.

The larger v4 work is reworking `tailwindConfig.ts` (a v3 JS-config idiom) into v4's CSS-first model (`@theme` /
`@config` + `@plugin`). This vendored plugin is a small, self-contained, already-v4-ready piece of that migration.

**Sanity-check at migration:** confirm `prose` output renders and that
`tailwindcss/colors` still resolves under v4 (0.5.20's `styles.js` imports it, so it should).
