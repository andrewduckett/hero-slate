# AGENTS.md

Guidance for AI agents working in this repo. `CLAUDE.md` is a symlink to this file.

## What this is

Hero Slate renders simple Dungeons & Dragons character sheets from hand-edited
YAML, as a static web app with no backend. It exists to invert a reference-heavy
sheet: show **who you are and what you have** — stats, hit points, trackers, short
prompts — so a 9-year-old describes what she wants to do instead of reading a menu
of legal moves. The product intent lives in `openspec/prd.md`; the release plan and
milestone status live in `openspec/discovery.md`.

## Durable constraints (honor in every change)

- **Static-first, no backend this release.** The site builds to pure static assets
  with SvelteKit `adapter-static`: a prerendered app shell, `ssr = false`, and an
  SPA fallback for clean paths. It ships **no** server-side Worker code or server
  functions. To add server rendering later, swap the adapter — not the framework.
  See `docs/adr/0001-static-first-sveltekit-on-cloudflare-workers.md`.
- **Character data sits behind a provider interface.** Consumers depend only on
  `getCharacter(id)` from `src/lib/data/provider.ts`, never on a file path or URL.
  A character is a **stable logical id** (e.g. `sunny`), not a filename, so it can
  resolve to a YAML file today and a hosted database record tomorrow. Keep palette
  and rendering knowledge out of the provider. See
  `docs/adr/0002-character-data-behind-a-provider-interface.md`.
- **No future-DB traps.** A later phase may add a hosted database, accounts, and
  cross-device sync. Keep definition data separate from per-device state, keep the
  `Character` type JSON-clean, and route everything through the provider so that
  move swaps one component rather than rippling through every screen.
- **Validate at the boundary, resolve in the layer that owns meaning.** The
  provider validates identity fields as data (`name` required; `level`, `class`,
  `color` optional and type-checked) and carries unknown values through unresolved.
  Domain layers interpret them — e.g. the theming layer resolves a `color` name to
  a palette and falls back to `neutral`, so a bad name never breaks a sheet.
- **Theme tokens have one source of truth.** `src/lib/theme/palette.ts` is the
  only place color values live; `palette.css` is **generated** from it and must
  never be hand-edited. Light/dark is a pure `prefers-color-scheme` media query
  with no toggle, and every accent/on-accent and foreground/surface pair meets
  WCAG AA — enforced by tests that read the emitted CSS.

## Toolchain

- **Runtime:** Node 22 (`.nvmrc`). **Package manager:** npm (`package-lock.json`).
- **Framework:** SvelteKit + Svelte 5 (runes), TypeScript, Vite.
- **Tests:** Vitest + `@testing-library/svelte` in a jsdom environment.
- **Data:** `yaml`. **Deploy:** Cloudflare Workers static assets via `wrangler`.

Commands (see `package.json`):

```bash
npm run dev              # vite dev server
npm run build            # regenerate palette.css, then build static ./build
npm run preview          # preview the production build
npm test                 # vitest run (the full suite)
npm run test:watch       # vitest in watch mode
npm run check            # svelte-kit sync + svelte-check (type-check)
npm run generate:palette # rewrite src/lib/theme/palette.css from palette.ts
npm run deploy           # build + wrangler deploy
```

Before opening a PR, run `npm test` and `npm run build` locally and confirm both
are green. CI currently runs **CodeQL only** (on push/PR to `main`); it does not
run the test suite or the build yet, so local verification is the gate. Practice
TDD: write the failing test first, then make it pass.

Known gap: `npm run check` reports `node:fs`/`process` type errors because the repo
has no `@types/node` and tests read files with `node:fs`. This predates current
work; treat those specific errors as noise until `@types/node` is added.

## Workflow

- Planning uses **OpenSpec**. In-flight work lives under `openspec/changes/`;
  durable specs under `openspec/specs/`; decision records under `docs/adr/`. Use
  the `opsx:*` skills (propose → apply → verify → archive).
- The roadmap is `openspec/discovery.md` — a prioritized list of thin vertical
  stories. **One story = one OpenSpec change.** When asked to build the next thing
  without a specific request, pick the next unchecked story and use its packet as
  the input. After a change ships, check its story off and sync its delta specs
  into `openspec/specs/` before archiving.
- **Git discipline:** a change's proposal must reach `main` before apply depends on
  it, and archive runs from `main` after implementation is merged. Never create
  commits, branches, or merges unless the user asks.

## Writing document artifacts — plain language

Write every document artifact — README, ADRs, OpenSpec proposals/designs/specs,
`docs/`, PR descriptions, and other prose — to the **ISO 24495 Plain Language**
standard: reader-first, purposefully structured, findable, understandable, and
actionable. Apply the core standard (`iso-24495-1`) to all prose, and the
science/technical sector standard (`iso-24495-3`) to design docs, specs, and
software documentation. This governs prose only — code, config, and test fixtures
follow their own conventions.
