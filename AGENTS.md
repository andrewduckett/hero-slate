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
  See `docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md`.
- **Character data sits behind a provider interface.** Consumers depend only on
  `getCharacter(id)` from `src/lib/data/provider.ts`, never on a file path or URL.
  A character is a **stable logical id** (e.g. `sunny`), not a filename, so it can
  resolve to a YAML file today and a hosted database record tomorrow. Keep palette
  and rendering knowledge out of the provider. See
  `docs/decisions/0002-character-data-behind-a-provider-interface.md`.
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

- Planning uses **OpenSpec**: in-flight work lives under `openspec/changes/`;
  durable specs under `openspec/specs/`; decision records under `docs/decisions/`. Use
  the `opsx:*` skills (propose → apply → verify → archive).
- **Toolchain is per stack.** v0.10.x: Node 20+, npm, Vite/React, Hono, Drizzle —
  gate with **`npm run check`** (TypeScript) after every change to `apps/`/`packages/`.
  v2: cargo workspace under `backend/`, orchestrated by the root `justfile` — gate with
  **`just check`** (fmt + clippy `-D warnings` + tests + arch-boundary lint) after every
  change to `backend/`. Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`,
  `test:`).
- **Releases are tag-driven** — bump `package.json`, add a `CHANGELOG.md` entry, then
  push a `v*.*.*` tag; the workflow does the rest. Never `gh release create` manually.

### OpenSpec git workflow

One branch and one pull request carry a change through its whole lifecycle —
propose, apply, verify, archive — and merge once. There is no "cross `main`
between phases" step.

- **Branch per change.** One OpenSpec change (one discovery story) = one branch =
  one PR. Dependent stories **stack**: branch off the parent's branch and target
  its PR; independent stories branch off `main`.
- **A commit per unit of work.** Each artifact (proposal, design, specs, tasks) is
  its own `docs:` commit; each implementation task is its own commit with its real
  type (`feat:`/`fix:`/`refactor:`/`test:`); the archive is its own `chore:` commit.
- **Draft until archived.** Open the PR as a draft at propose. Run propose → apply →
  verify → archive all on the branch; `archive` moves the change to
  `openspec/changes/archive/` and syncs delta specs into `openspec/specs/`. Flip the
  PR to ready when the archive commit lands.
- **User owns the merge.** The agent never merges a PR unless explicitly asks and 
  confirmed. Stacks merge bottom-up: parent to `main` first, then retarget and merge 
  each child.
- **If a ready PR gets change-requests,** flip it back to draft and `git revert` the
  archive commit — this restores the change under `openspec/changes/` and unwinds the
  spec sync. Make the fixes, re-archive as the last commit, and flip ready again. A
  rejected PR is just closed and its branch deleted; `main` stays clean.
- **Issue provenance.** When a change originates from a GitHub issue, discovery
  records `Origin: #<issue>` on the story and propose carries it into `proposal.md`.
  A PR that fully resolves a single issue says `Closes #<issue>`; a PR that is one of
  many stories under an epic or milestone issue says `Part of #<issue>`, and that
  parent issue is closed only once `discovery.md` shows all its stories archived.

## Writing document artifacts — plain language

Write every document artifact — READMEs, ADRs, GitHub issue bodies/designs, `docs/`,
PR descriptions, and other prose deliverables — to the **ISO 24495 Plain Language**
standard: reader-first, purposeful structure, findable, understandable, and
actionable. Apply the core standard (`iso-24495-1`) to all prose, and the
science/technical sector standard (`iso-24495-3`) to architecture specs, design docs,
and software documentation. This governs prose only — code, config, and test fixtures
follow the toolchain's own conventions.

## Scratch & Working Files

Temporary files — scratch notes, intermediate output, working scripts, throwaway data — go in
**`.workspace/`** at the repo root. It is gitignored (see `.gitignore`). **Use it instead of `/tmp`
or any scratchpad path your tooling suggests** — this convention overrides a harness-provided
scratchpad location. Create the directory if it isn't there (`mkdir -p .workspace`). Nothing durable
lives here; anything worth keeping belongs in the repo tree or a GitHub issue.

