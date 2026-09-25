# 🐉 Hero Slate

## 🧐 What is this thing?

Hero Slate renders simple **Dungeons & Dragons character sheets** from hand-edited
YAML, as a static web app with no backend. Open a character by a clean link — for
example `/sunny` — and the sheet shows who they are and what they have.

It was built so a 9-year-old could join a family D&D game. The lesson from the
first attempt: a sheet that lists **everything a character *can* do** makes a kid
spend her time *reading options* instead of *describing what she wants to do*. Hero
Slate inverts that. The sheet says, in effect, *"Here's who you are and what you
have — now go describe what you want,"* and keeps the reference clutter off the
page. The full product intent is in [`openspec/prd.md`](openspec/prd.md).

## 🧩 The idea

- **Static, file-based, no database.** Characters are YAML files edited directly on
  GitHub. The app fetches and renders them in the browser — no server, no accounts.
- **No traps for a future hosted phase.** Character data is reached only through a
  provider interface keyed by a **stable logical id** (never a filename), so a later
  move to a hosted database swaps one component instead of every screen.
- **Readable in any room light.** A named color palette themes each sheet and the
  page follows the device's light/dark preference automatically, at accessible
  contrast.

## 📦 Install

Requires [Node 22](.nvmrc) and npm.

```bash
npm install
```

## ⚙️ Usage

```bash
npm run dev        # local dev server (http://localhost:5173)
npm run build      # regenerate palette.css, then build static ./build
npm run preview    # serve the production build locally
npm run deploy     # build + wrangler deploy to Cloudflare Workers
```

Open a character at `/<id>` (e.g. `/sunny`); the index at `/` explains how to open
one.

### Adding a character

Drop a `<id>.yaml` file in [`static/characters/`](static/characters). The filename
stem is the character's logical id and the URL path.

A file must not declare an `id` that differs from its filename. An invalid identity
field or unparseable YAML shows a "not found" message rather than crash — the id is
never echoed back. The full field reference is in
[Character YAML reference](#character-yaml-reference) below.

### Character YAML reference

Every field the app renders, with validation rules and markup syntax:

```yaml
# ── Identity ─────────────────────────────────────────────────────────────────
# Validated on every load. An invalid identity field shows a "not found" message.
name: Sunny Thornwood        # required — non-empty string
level: 6                     # optional — finite number
class: Druid                 # optional — any string
color: forest                # optional — palette name; unknown names fall back to neutral
                             # palette names: forest | fire | ocean | berry | sun | neutral

# ── Ability scores ───────────────────────────────────────────────────────────
# An ordered list of labeled entries. Author any labels you like — the app
# assumes no fixed ability names. A number value computes a modifier
# automatically (floor((value − 10) / 2)). A string value (e.g. "+2") renders
# verbatim with no modifier computed. The order you author is the order shown.
abilities:
  - label: Strength
    value: 10        # shows score 10, modifier −0
  - label: Dexterity
    value: 14        # shows score 14, modifier +2
  - label: Wisdom
    value: 18        # shows score 18, modifier +4

# ── Combat stats ─────────────────────────────────────────────────────────────
# Same entry shape as abilities. String values render verbatim; numbers render
# as their numeric value. A missing or invalid value shows an em dash (—).
combat:
  - label: Armor Class
    value: 15
  - label: Speed
    value: 30
  - label: Initiative
    value: "+2"      # string — the plus sign is preserved

# ── Hit points ───────────────────────────────────────────────────────────────
# Author max only — must be a positive integer. Current HP is per-device state;
# a new character starts at full health. Do not author a current value here.
hitPoints:
  max: 45

# ── Resource pools ───────────────────────────────────────────────────────────
# Each pool tracks a countable resource: spell slots, ki, etc.
# Author max only — remaining uses are per-device state.
pools:
  - id: spell-slots-1        # required — unique in this file; lowercase, starts
                             # alphanumeric, then alphanumeric or hyphens
    label: 1st Level         # required — display name
    color: ocean             # optional — any palette name
    max: 4                   # required — integer, 1–12
  - id: wild-shape
    label: Wild Shape
    color: forest
    max: 3

# ── Sections ─────────────────────────────────────────────────────────────────
# Free-text areas. A section needs a title and at least one valid row.
# A row needs a body — rows without a body are silently dropped.
# color on a row inherits from its section when omitted on the row.
# An unknown or missing color falls back to neutral on both sections and rows.
sections:
  - title: Your Turn
    color: forest            # optional — any palette name
    rows:
      - title: Attack        # optional row title
        body: "Claws: [[d20+6]] to hit, [[2d6+4]] damage"
      - title: Heal
        body: "Restore [[2d8+3]] hit points, or give an ally [[+d4]]"
  - title: Strengths
    rows:
      - title: Sneaking
        body: "moving quietly & hiding, [[+5]] bonus"
      - body: "a row with no title is fine too"
```

**Rich-text markup** is valid in any `body` field:

| Syntax | Renders as |
|---|---|
| `[[2d6+4]]`, `[[d20]]` | Highlighted dice pill |
| `[[+3]]`, `[[-1]]` | Highlighted bonus pill |
| `**word**` | Bold |
| `*word*` | Italic |

## 🎨 Theming

Colors come from a **fixed named palette**: `forest`, `fire`, `ocean`, `berry`,
`sun`, and a `neutral` default. Set a character's `color` to one of those names to
theme the identity header; an unknown or missing name falls back to `neutral`, and
a raw hex value is never honored.

- [`src/lib/theme/palette.ts`](src/lib/theme/palette.ts) is the single source of
  truth: each name has a light and a dark accent/on-accent pair, plus a shared
  surface and foreground.
- `src/lib/theme/palette.css` is **generated** from it (`npm run generate:palette`,
  and automatically before every `npm run build`) — never edit it by hand.
- Light and dark switch on `prefers-color-scheme` with no toggle. Every
  accent/on-accent pair and the foreground-on-surface pair meets WCAG AA (4.5:1) in
  both modes, checked by tests that read the emitted CSS.

## 🏗️ Design notes

- **Static-first SvelteKit.** Built with `adapter-static`, run fully static this
  release (`ssr = false`, prerendered shell, SPA fallback for clean paths), served
  on Cloudflare Workers static assets. Adding server rendering later is an adapter
  swap, not a framework change. See
  [`docs/decisions/0001`](docs/decisions/0001-static-first-sveltekit-on-cloudflare-workers.md).
- **Data behind a provider.** The UI depends only on `getCharacter(id)`, which
  returns one of four typed results (`found`, `not-found`, `invalid`, `error`) and
  never throws. See
  [`docs/decisions/0002`](docs/decisions/0002-character-data-behind-a-provider-interface.md).

The SPA fallback is why `/sunny` resolves on direct load and refresh:
`wrangler.jsonc` sets `not_found_handling: "single-page-application"`, so any path
with no matching asset serves the app shell, while a real `/characters/<id>.yaml`
is served as-is.

## 📁 Project layout

```
src/
  app.html                     # prerendered app shell
  lib/
    data/                      # provider interface + YAML implementation
    theme/                     # palette source of truth, generated CSS, resolver, contrast
    CharacterView.svelte       # the sheet; format.ts, types.ts
  routes/
    +layout.svelte / .ts       # ssr=false, prerender; imports palette.css site-wide
    +page.svelte               # index
    [id]/+page.svelte / .ts    # resolve a logical id through the provider
scripts/                       # palette.css generator (runs before build)
static/characters/             # <id>.yaml definitions, shipped as public assets
openspec/                      # prd, discovery roadmap, specs, changes (+ archive)
docs/decisions/                      # architecture decision records
```

## 🛠️ Development

```bash
npm test           # vitest run — the full suite
npm run test:watch # vitest in watch mode
npm run check      # svelte-kit sync + svelte-check (type-check)
```

Run `npm test` and `npm run build` before opening a PR — both must be green. CI runs
CodeQL only for now, so local verification is the gate. Practice TDD: write the
failing test first.

## 🤖 For AI agents

This project plans with **OpenSpec**. In-flight work lives under
`openspec/changes/`, durable specs under `openspec/specs/`, and decision records
under `docs/decisions/`. The backlog is GitHub issues — one issue per change — and
`openspec/discovery.md` holds the personas and journeys behind it.
Two constraints hold across every change: the core stays **static with no backend**
this release, and character data is reached **only through the provider interface**
keyed by a logical id. Full guidance is in [`AGENTS.md`](AGENTS.md).
