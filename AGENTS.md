# AGENTS.md

Guidance for AI agents working in this repo. `CLAUDE.md` is a symlink to this file.

## What this is

Hero Slate renders simple Dungeons & Dragons character sheets from hand-edited
YAML, as a static web app with no backend. It exists to invert a reference-heavy
sheet: show **who you are and what you have** — stats, hit points, trackers, short
prompts — so a 9-year-old describes what she wants to do instead of reading a menu
of legal moves. The product intent lives in `openspec/prd.md`; personas and journeys live in `openspec/discovery.md`; the backlog is GitHub issues.

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
  never be hand-edited. A manual toggle exists on every route; a player's
  per-device choice persists via `src/lib/theme/preference.ts` and overrides the
  device preference until the player chooses again; dark is the resting default
  when no choice is stored and no device preference is stated. Every
  accent/on-accent and foreground/surface pair meets WCAG AA — enforced by tests
  that read the emitted CSS.

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

## Project workflow notes

The shared workflow rules are in the lets-spec block at the end of this file.
This project adds:

- **A story packet's `MoSCoW` line matches its priority label.** When you change
  one, change the other in the same edit. Set the label with the `lets-shape`
  backlog script, not with `gh`.
- **Apply `iso-24495-3`** (science and technical writing) to architecture specs,
  design docs and software documentation, on top of the core plain-language rule.

<!-- BEGIN lets-spec rules. lets-sync rewrites this block: change lets-spec, not this text. -->
## Workflow

These rules come from lets-spec, and apply to every agent.

- **Plan product changes with OpenSpec.** Work in progress lives in
  `openspec/changes/`, specs in `openspec/specs/`, and decision records
  in `docs/decisions/`. A change starts with a brainstorm and ends with
  archive. The schema's instructions say what to do at each step in
  between. [Routing](#routing) says where each request starts.
- **One change is one branch and one pull request,** from propose to
  archive. Independent changes branch off the repository's default
  branch. A change that
  depends on another stacks: it branches off the other change's branch
  and targets its pull request.
- **One commit per unit of work,** with Conventional Commits: `feat:`,
  `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- **Run the project's checks** before you push, and fix what they
  report. The project's own instructions say how to run them.
- **When you review code, also apply the project's `REVIEW.md`,** if it
  has one.
- **Use the entry points' backlog scripts for issue selection, kind and
  priority.** `lets-build`'s script picks and claims stories, and
  `lets-shape`'s sets kind and priority. Never set an issue's kind or
  priority with `gh` directly. Every story is an issue, and its pull
  request says `Closes #<n>`. An epic is a parent issue with its stories
  as sub-issues. Dependencies are "blocked by" links. Put a blocker on
  each story it blocks, never only on the epic: picking the next story
  cannot see a blocker on a parent issue. A "relates to" link never
  counts as a blocker.
- **The user owns the merge.** Never merge a pull request unless the
  user asks. Stacks merge bottom-up.
- **Change requests reopen an archived change.** If a ready pull request
  gets change requests, mark it as a draft again and `git revert` the
  archive commit. Make the fixes, archive again as the last commit, and
  mark it ready. A rejected pull request is closed and its branch
  deleted.
- **Never edit what lets-spec puts in the project:** this section,
  between its markers, the skills in `.agents/skills/` and the schema
  folder in `openspec/schemas/`. `lets-sync` rewrites this section, and
  the skills and the schema are read-only links into the Nix store that
  git ignores. Change lets-spec instead. Never run `openspec init` or
  `openspec update`; they write skills of their own.

### Routing

| Request | Start with |
|---|---|
| A large idea, or work that needs splitting or prioritizing | The `lets-shape` skill |
| Start the next story, or move the current branch's change on | The `lets-build` skill |
| A tooling or dependency change that changes no behavior | An ordinary branch and pull request, with no OpenSpec change |

### Writing

- **Write prose in plain language** (ISO 24495): READMEs, decision
  records, issue bodies, `docs/`, pull request descriptions and OpenSpec
  artifacts. Put the reader first, and make each document easy to find,
  understand and act on. Code and config follow their own conventions.
- **Put scratch files in `.workspace/`** at the repo root, not in `/tmp`
  or a scratch path your tool suggests. Create it if it is missing, and
  keep it out of git. Anything worth keeping belongs in the repo or an
  issue.
<!-- END lets-spec rules -->
