# Discovery: Simple Character Sheet Web App

> Status: complete
> Created: 2026-09-18 · Last revised: 2026-09-20 (added `palette-depth`, `theme-preference`, `landscape-layout`)

> Release plan produced by the discovery skill. Resume or revise by re-running the skill.
> To build: run `/opsx:propose` and ask it to use the next unchecked story below.
> One story = one OpenSpec change (proposal ≈ 200 words). Create one at a time.

## Sources

- 2026-09-18 — `/home/andrew/Git/sheets/PRD.md` (Simple Character Sheet Web App). A
  static, installable PWA (Svelte + Vite, Cloudflare Pages) rendering multiple D&D
  character sheets from hand-edited YAML. Philosophy: show stats + trackers + short
  freeform prompts, not a catalog of moves, so a 9-year-old describes actions instead of
  reading options. Live tracking (HP, resource pools) in localStorage; data-provider and
  state-store behind interfaces to allow a future hosted DB.
- Repo state at discovery time: greenfield — only the OpenSpec scaffold and `PRD.md`
  exist; no application code. Every journey stage annotates as `gap` today.

## Scope, goals, non-goals

- **Scope**: static multi-character sheet renderer + live per-device trackers, config via
  YAML on GitHub, deployed to Cloudflare Pages as a PWA.
- **Goals**: simple sheet (ability scores, HP, AC, speed, initiative, resource pools);
  minimal reading to operate; multiple characters; no backend; YAML config; no future-DB
  traps (provider/state-store interfaces, logical IDs, separated definition vs state).
- **Non-goals (v1)**: in-app definition editing, in-app dice rolling, conditions/status,
  temp HP & death saves, cross-device sync/accounts.

## Personas

### Sunny — the Kid Player (9)

- **Who**: the 9-year-old at the table, holding her own tablet.
- **Goal**: know who her character is and track HP/magic during play *without reading
  rules*, so she can focus on describing what she wants to do.
- **Pain today**: the current sheet is a wall of spells/forms/formulas; she reads to find
  options instead of imagining them.
- **Success looks like**: opens her sheet, spends/restores HP and gems with taps, glances
  at a prompt, narrates an action — no adult decoding required.

### Andrew — the Parent Author/DM

- **Who**: the parent who runs the game, authors every character, and deploys the site.
- **Goal**: create/adjust characters by editing YAML on GitHub and have it live for
  everyone, with room to grow toward a hosted DB later.
- **Pain today**: the current sheet is bespoke HTML per character — no reuse, no
  multi-character story, hand-maintained.
- **Success looks like**: adds a character with one file + one manifest line; edits land
  on next online open; never boxed out of a future backend.

### Andrew-as-Player — the Parent playing their own character

- **Who**: the same parent, but at the table running *their* character (not authoring).
- **Goal**: track their own HP/resources during play on their own device, with a
  character that may be mechanically richer (more pools, more sections) than the kid's.
- **Pain today**: no personal sheet exists in this system; the current site is one
  bespoke page for Sunny only.
- **Success looks like**: opens `/andrew`, tracks a fuller resource set fluidly; the same
  UI scales up gracefully from the kid's minimal sheet.

> **Implication**: the player experience is shared across Sunny and Andrew-as-Player — the
> difference is *config density*, not different features. Build one player sheet that
> scales, not two.

## Journey Map

Greenfield repo — every stage is `gap` today (only OpenSpec scaffold + `PRD.md` exist).

**Player journey** (Sunny + Andrew-as-Player):

```
  Find my      Open the     See who      Track in     Restore     Reopen       Use with
  character ─► sheet     ─► I am     ─►  play      ─► after     ─► later     ─► no wifi
     │            │           │            │            │            │            │
    gap          gap         gap          gap          gap          gap          gap
```

1. **Find my character** — picker at `/` or deep link `/sunny` — gap
2. **Open the sheet** — character YAML loads & renders — gap
3. **See who I am** — identity, ability scores, AC/speed/initiative, prompts — gap
4. **Track in play** — tap HP ±, spend/restore resource pool dots — gap
5. **Restore after** — manual restore via bidirectional taps (no reset button) — gap
6. **Reopen later** — tracking state persisted per-device (localStorage) — gap
7. **Use with no wifi** — installed PWA, offline app shell + cached config — gap

**Author journey** (Andrew):

```
  Write YAML ─► Commit to ─► Build & ─► Character ─► Deep-link / ─► Iterate
  (char+manifest)  GitHub     deploy     in picker    home-screen     (edits propagate)
      │             │           │           │             │              │
     gap        partial        gap         gap           gap            gap
```

1. **Write YAML** — one file per character + manifest line — gap
2. **Commit to GitHub** — existing GitHub flow — partial (GitHub exists; repo not wired to a build)
3. **Build & deploy** — Cloudflare Pages builds Vite app, SPA fallback — gap
4. **Character in picker** — manifest drives home cards — gap
5. **Deep-link / home-screen** — clean path + PWA install icon — gap
6. **Iterate** — stale-while-revalidate so edits appear next online open — gap

## MoSCoW

### Must

- **App scaffold + Cloudflare Pages deploy** (Vite+Svelte, SPA fallback, clean-path
  routing) — Author: build & deploy; nothing ships without it.
- **YAML config via data-provider interface + manifest, logical IDs** — Author: write
  YAML; Player: open sheet. The interface keeps the future DB un-trapped.
- **Home picker from manifest** — Player: find my character.
- **Sheet render: identity + ability scores (compute modifier) + AC/speed/initiative** —
  Player: see who I am.
- **HP tracker + per-device state store (localStorage)** — Player: track/restore/reopen.
- **Resource pools tracker** (bidirectional dots) — Player: track/restore.
- **Custom sections + rich-text markup** (bold/italic/emoji/styled `[[dice]]`) — the whole
  philosophy: prompts instead of a rules catalog.
- **Named-palette theming + auto light/dark** — config references color names from day
  one; a kid must be able to read it.

### Should

- **PWA: installable + offline** (app shell + cached config) — flaky table wifi; icon.
- **Stale-while-revalidate config refresh** — edits propagate without going stale.
- **Unlisted/noindex access config** — cheap privacy.
- **Avatar images** — emoji works without it.

- **Sheet restyle + section reorder** (story 7) — Player: see who I am; the unstyled
  sheet reads worse than the bespoke page it replaces.
- **Palette depth + colour roles** (story 8) — Player: see who I am; two tokens per
  palette can only fill a shape, so the sheet reads as one hue and a name no longer
  describes its colour.
- **Theme default + toggle** (story 9) — Player: open the sheet; dark is the wanted
  default and no control exists to switch.
- **Landscape layout** (story 10) — Player: track in play; the table setup is a tablet
  on its side, and one narrow column wastes the wide axis.

### Could

- Pool number±view fallback for large counts (>12).
- Tap/roll micro-animations and visual polish.
- Install-icon / splash polish beyond the basics.

### Won't (this release)

- In-app definition editing; in-app dice rolling; conditions/status; temp HP & death
  saves; cross-device sync/accounts; the hosted DB itself. (These are the v1 non-goals;
  the architecture leaves room for the DB later.)

## Stories

Ordered release checklist. One story = one OpenSpec change (proposal ≈ 200 words).
Every story is a thin vertical slice — end-to-end and demoable, never a horizontal layer.
Repo is greenfield; "Relevant code" lists intended paths to create (Vite + Svelte).

- [x] 1. `walking-skeleton-deploy` — visit `/sunny` on the live site; identity renders from YAML
  - **Persona served**: Andrew (Author), Sunny (Player)
  - **Journey segment**: Author "build & deploy"; Player "find (deep link) → open → see who I am" (identity only)
  - **MoSCoW**: Must
  - **Why this story / why now**: walking skeleton — thinnest end-to-end path (config → provider → route → render → deployed). Establishes the data-provider interface and logical-ID routing that everything else builds on.
  - **Depends on**: nothing
  - **Scope**: in: Vite+Svelte scaffold; `data-provider` interface with a YAML implementation; clean-path route `/:id` with SPA fallback; render identity header (name + formatted `Level X Class`); one `characters/sunny.yaml` + Cloudflare Pages build/deploy. / out: picker, stats, trackers, theming, PWA.
  - **Relevant code**: greenfield — `vite.config.*`, `src/main`, `src/lib/data/provider.*`, `src/routes|pages`, `characters/sunny.yaml`, Cloudflare `_redirects`/adapter config.
  - **Added**: 2026-09-18
  - **Change**: `walking-skeleton-deploy` (implemented, archived 2026-09-18)

- [x] 2. `named-palette-theming` — sheet shows in the character's palette color; auto light/dark
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "see who I am" (legibility)
  - **MoSCoW**: Must
  - **Why this story / why now**: config references color names from story 1 onward; later stories (sections, picker) need the palette + dark mode to render correctly. Do it early.
  - **Depends on**: story 1
  - **Scope**: in: named palette → CSS custom-property tokens (light + dark values); `prefers-color-scheme` auto switch; apply a character's `color` to the sheet chrome; readable-contrast defaults. / out: per-row/section colors (arrive with story 6), user-facing theme toggle (added in story 9).
  - **Relevant code**: `src/lib/theme/palette.*`, global CSS tokens, sheet header component.
  - **Added**: 2026-09-18
  - **Change**: `named-palette-theming` (implemented, archived 2026-09-19)

- [x] 3. `stat-block` — ability scores with computed modifiers + AC/speed/initiative
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "see who I am"
  - **MoSCoW**: Must
  - **Why this story / why now**: completes the static identity picture the player reads at a glance; pure render, no state.
  - **Depends on**: stories 1, 2
  - **Scope**: in: six ability scores from authored scores, modifier `floor((score-10)/2)` shown prominently, raw score small; Armor Class + Speed (authored); Initiative auto from DEX with file override; standard D&D labels. / out: any tracking/interaction, custom sections.
  - **Relevant code**: `src/lib/character/abilities.*` (modifier calc), stat-block components.
  - **Added**: 2026-09-18
  - **Change**: `stat-block` (implemented, archived 2026-09-19)

- [x] 4. `hp-tracker` — tap ± to change HP; state remembered across reloads
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "track in play → restore after → reopen later" (HP)
  - **MoSCoW**: Must
  - **Why this story / why now**: core interactive value; introduces the `state-store` interface (localStorage impl) that keeps tracking state separate from definition — the second half of the future-DB safety.
  - **Depends on**: story 1
  - **Scope**: in: `current/max` readout + slim bar; −1/−5/+1/+5 bidirectional; clamp `0..max`; gentle "down" state at 0; `state-store` interface + localStorage impl keyed by logical id; reconcile stored current vs new max on load. / out: reset button (manual restore by design), pools, temp HP/death saves.
  - **Relevant code**: `src/lib/state/store.*`, `src/lib/state/localStorage.*`, HP component.
  - **Added**: 2026-09-18
  - **Change**: `hp-tracker` (implemented, archived 2026-09-19)

- [x] 5. `resource-pools` — tap pool dots to spend/restore; persists per device
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "track in play → restore after" (spell slots/rage/ki…)
  - **MoSCoW**: Must
  - **Why this story / why now**: second tracker; reuses the state-store from story 4. Rules-agnostic pools cover spell-slot levels, rage, ki, etc.
  - **Depends on**: story 4
  - **Scope**: in: config-defined pools `{label,color,max}`; rows of bidirectional tappable dots; per-pool persistence via state-store; reconcile dot count vs changed `max`. / out: number±fallback for >12 (Could), reset button, rest mechanics.
  - **Relevant code**: pool components; extend `src/lib/state/*` for pool state.
  - **Added**: 2026-09-18
  - **Change**: `resource-pools` (implemented, archived 2026-09-19)

- [x] 6. `custom-sections-richtext` — freeform titled sections with markup + styled dice pills
  - **Persona served**: Sunny (prompts), Andrew (authoring), Andrew-as-Player
  - **Journey segment**: Player "see who I am" (the philosophy payload: prompts, not a catalog)
  - **MoSCoW**: Must
  - **Why this story / why now**: the reason the product exists — replaces the rules catalog with short freeform prompts. Kept whole: the markup renderer and section layout are inert without each other.
  - **Depends on**: stories 2, 3
  - **Scope**: in: config-defined ordered sections `{title,color,rows:[{title,color?,body}]}`; titled rich-text row layout (colored title left, body right); XSS-safe markup renderer for `**bold**`, `*italic*`, emoji, and `[[d20+3]]` → styled non-interactive dice pill; optional `+N` badge on strengths rows; section hidden if absent. / out: interactive dice rolling, raw HTML in config, hex colors.
  - **Relevant code**: `src/lib/richtext/*` (parser + dice pill), section/row components.
  - **Added**: 2026-09-18
  - **Change**: `custom-sections-richtext` (implemented, archived 2026-09-19)

- [x] 7. `sheet-restyle` — the sheet gets a real visual design, in the example sheet's section order
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "see who I am" + "track in play" (legibility and polish)
  - **MoSCoW**: Should
  - **Why this story / why now**: stories 1–6 shipped behavior with almost no styling — browser-default serif, full-bleed header, no spacing. The sheet a child reads should look at least as polished as the bespoke page it replaces (`static.home.duckett.fun/sunny/`). Do it before the picker so picker cards can reuse the new card style.
  - **Depends on**: stories 2, 3, 4, 5, 6
  - **Scope**: in: restyle every existing block (header, ability tiles, combat tiles, HP tracker, pool dots, section cards) with a fresh look; reorder blocks to the example's order — header, stats (abilities then combat), health, pools, sections; self-hosted display + body web fonts served as static assets; any new color tokens added to `palette.ts` and AA-checked in light and dark; move Sunny's "Strengths" section before "Your Turn" in `sunny.yaml`. / out: new data fields (story, quote, callout, spell/animal cards), changes to tracker behavior (e.g. tappable hearts), a theme toggle (added in story 9).
  - **Relevant code**: `src/lib/CharacterView.svelte` (block order), `src/lib/character/*Block.svelte`, `src/lib/theme/palette.ts` + generated `palette.css`, `src/routes/+layout.svelte`, `static/fonts/`, `static/characters/sunny.yaml`.
  - **Added**: 2026-09-19
  - **Change**: `sheet-restyle` (archived 2026-09-19)

- [x] 8. `palette-depth` — palette names get a wash and a readable mark; colour marks meaning, not just the character
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "see who I am" + "track in play" (legibility and polish)
  - **MoSCoW**: Should
  - **Why this story / why now**: a palette defines only an accent and the text on it. Two tokens can fill a shape and nothing else. So the whole sheet renders in one hue, and two spec rules force every accent dark — `sun` is a brown and `berry` a magenta. The bespoke page this app replaces gives every accent a soft companion and colours by meaning. Do it before the picker, so picker cards inherit the finished tokens.
  - **Depends on**: stories 2, 3, 7
  - **Scope**: in: four tokens per palette name (`accent`, `onAccent`, `tint`, `deep`) in both modes; move the readable-as-text rule from `accent` to `deep`; let light-mode `onAccent` vary per name; retune `sun` and `berry`; one warm structural base colour; a warmer raised surface; fixed colour roles for hit points, armour class, speed, and initiative; apply the tokens across every block; extend the contrast tests to each new pairing. / out: a light/dark toggle or a new default mode (story 9); page width and block layout (story 10); new character data fields; a per-palette ramp beyond four tokens.
  - **Relevant code**: `src/lib/theme/palette.ts`, `generate.ts`, generated `palette.css`, `palette.test.ts`, `emitted-css.test.ts`, `src/lib/character/*Block.svelte`, `src/lib/CharacterView.svelte`, `src/lib/richtext/RichText.svelte`.
  - **Added**: 2026-09-20
  - **Change**: `palette-depth` (implemented, archived 2026-09-20)

- [x] 9. `theme-preference` — the sheet opens dark, and a control switches modes
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "open the sheet" + "see who I am" (control over legibility)
  - **MoSCoW**: Should
  - **Why this story / why now**: the app follows the device preference and offers no control. A player who wants the other mode cannot get it without changing a device setting. Dark is the preferred default at the table. **This reverses a durable constraint**: `AGENTS.md`, story 2, and story 7 all state that light/dark is a pure `prefers-color-scheme` media query with no toggle. Update that text as part of this story.
  - **Depends on**: stories 2, 8
  - **Scope**: in: dark as the default when the device states no preference; a toggle control; the chosen mode persisted per device in one global stored value under its own key — not the character-state store, since the mode belongs to no character (see ADR 0008); a `data-theme` selector path alongside the media query; no flash of the wrong mode on load, given a prerendered shell with `ssr = false`; contrast tests cover both selector paths; amend the no-toggle wording in `AGENTS.md` and in stories 2 and 7. / out: a per-character mode; a system/light/dark tri-state if a simple toggle serves; new palette values.
  - **Relevant code**: `src/lib/theme/generate.ts`, generated `palette.css`, `src/routes/+layout.svelte`, `src/app.html`, `src/lib/state/*`, `src/lib/theme/emitted-css.test.ts`, `AGENTS.md`.
  - **Added**: 2026-09-20
  - **Change**: `theme-preference` (implemented, archived 2026-09-22)

- [ ] 10. `landscape-layout` — the sheet uses a landscape tablet's width instead of one narrow column
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "see who I am" + "track in play" (reach and glanceability)
  - **MoSCoW**: Should
  - **Why this story / why now**: the expected table setup is a tablet on its side in a kickstand. That is wide and short. The sheet caps content at 44rem in a single column, so it wastes the plentiful axis and stacks everything in the scarce one. The two blocks a player touches most, hit points and pools, fall below the fold.
  - **Depends on**: stories 3, 4, 5, 6, 7
  - **Scope**: in: a landscape breakpoint that places blocks in more than one column; a wider content cap on wide screens; keep the trackers reachable without scrolling on a landscape tablet; the ability grid uses a fixed column count per breakpoint, never `auto-fit`, so a lone tile can never orphan; portrait and phone layouts keep working. / out: colour and token work (story 8); a theme toggle (story 9); new blocks or data fields; changes to tracker behaviour.
  - **Relevant code**: `src/lib/theme/base.css` (`.page`), `src/lib/CharacterView.svelte`, `src/lib/character/AbilitiesBlock.svelte`, `ResourcePoolsBlock.svelte`.
  - **Added**: 2026-09-20
  - **Change**: _not yet proposed_

- [ ] 11. `home-picker` — `/` lists characters as tappable cards
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "find my character" (choose among many)
  - **MoSCoW**: Must
  - **Why this story / why now**: friendly "choose your hero" discovery once multiple characters exist; deep links already work, so this is the multi-character front door.
  - **Depends on**: stories 1, 2
  - **Scope**: in: `manifest.yaml` (`id`,`name`,`color`,`avatar`) loaded via data-provider; `/` renders large tappable cards; tap → `/:id`; add-a-character = one file + one manifest line. / out: search/filter, per-card state preview.
  - **Relevant code**: `manifest.yaml`, `src/routes/index`, picker card component; extend `data-provider` with `listCharacters()`.
  - **Added**: 2026-09-18
  - **Change**: _not yet proposed_

- [ ] 12. `pwa-install` — installable app with manifest + icons
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "use with no wifi" (home-screen install half)
  - **MoSCoW**: Should
  - **Why this story / why now**: quick win — "Add to Home Screen" gives the full-screen `/sunny` icon; lower risk than the service-worker caching half.
  - **Depends on**: story 1
  - **Scope**: in: web app manifest, icons, theme/display config, installability. / out: service worker, offline caching (story 13).
  - **Relevant code**: `public/manifest.webmanifest`, icon assets, `<head>` wiring.
  - **Added**: 2026-09-18
  - **Change**: _not yet proposed_

- [ ] 13. `offline-caching` — works with no wifi; edits refresh next online open
  - **Persona served**: Sunny, Andrew-as-Player, Andrew (Author)
  - **Journey segment**: Player "use with no wifi"; Author "iterate (edits propagate)"
  - **MoSCoW**: Should
  - **Why this story / why now**: resilience for flaky table wifi. Riskier than install (SW lifecycle), so it follows story 9.
  - **Depends on**: stories 1, 12
  - **Scope**: in: service worker; cache-first app shell with versioned update + "refresh" prompt on new deploy; stale-while-revalidate for character/manifest config. / out: background sync, push, cross-device state.
  - **Relevant code**: SW registration + strategy config (e.g., Vite PWA/Workbox), build integration.
  - **Added**: 2026-09-18
  - **Change**: _not yet proposed_

- [ ] 14. `unlisted-access` — site is public but not search-indexed
  - **Persona served**: Andrew (Author)
  - **Journey segment**: Author "build & deploy" (privacy)
  - **MoSCoW**: Should
  - **Why this story / why now**: cheap privacy for a child's page; content stays low-sensitivity and shareable by link.
  - **Depends on**: story 1
  - **Scope**: in: `noindex`/robots headers or meta; no exposed directory beyond the manifest. / out: Cloudflare Access/login (explicitly not chosen).
  - **Relevant code**: `robots.txt`, response headers / meta, Cloudflare Workers static-assets config (`wrangler` / `static/_headers`).
  - **Added**: 2026-09-18
  - **Change**: _not yet proposed_

- [ ] 15. `avatar-images` — image avatars in header and picker cards
  - **Persona served**: Sunny, Andrew-as-Player
  - **Journey segment**: Player "find my character" + "see who I am" (polish)
  - **MoSCoW**: Should
  - **Why this story / why now**: emoji avatars already work from earlier stories; images are the enhancement.
  - **Depends on**: stories 3, 11
  - **Scope**: in: `avatar` accepts an image path (repo asset) as well as emoji; render in header + picker card with sensible fit/fallback. / out: uploads, cropping, remote images.
  - **Relevant code**: identity header + picker card components; `characters/` or `public/` asset handling.
  - **Added**: 2026-09-18
  - **Change**: _not yet proposed_

## Open Questions

- None blocking. Reversible defaults set during the design interview: Svelte (vs Preact),
  `[[d20+3]]` dice delimiter, auto light/dark following the device.
- **Routing approach** (resolve in story 1): SvelteKit + `adapter-cloudflare` vs plain
  Svelte SPA + a micro-router (e.g. navaid/svelte-spa-router). Either satisfies clean
  paths + SPA fallback; pick when scaffolding.
- **Palette definition** (resolve in story 2): the concrete set of color names and their
  light/dark values.

## Change Log

- 2026-09-18 — Initial discovery started from `PRD.md`; Phase 1 (ingest) captured.
- 2026-09-18 — Added personas (incl. Andrew-as-Player); journey maps; MoSCoW; 11 stories.
  Splits: kept `custom-sections-richtext` whole; split PWA into `pwa-install` +
  `offline-caching`. Discovery marked complete.
- 2026-09-19 — Revision: inserted story 7 `sheet-restyle` (Should) ahead of `home-picker`
  after reviewing the live sheet against the bespoke example; renumbered stories 7–11 to
  8–12 and their dependencies; reconciled stories 3–6 as archived; `unlisted-access` (now 11) points
  at Cloudflare Workers static-assets config instead of Cloudflare Pages.
- 2026-09-20 — Revision: inserted stories 8 `palette-depth`, 9 `theme-preference`, and
  10 `landscape-layout` ahead of `home-picker`, after comparing the live sheet with the
  bespoke page it replaces. Renumbered stories 8–12 to 11–15 and updated their
  dependency references. `theme-preference` reverses the no-toggle constraint recorded
  in `AGENTS.md` and in stories 2 and 7; that story owns the amendment.
