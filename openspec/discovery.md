# Discovery: Simple Character Sheet Web App

> Created: 2026-09-18 · Last revised: 2026-09-24 (backlog moved to GitHub issues)

> The living map behind the backlog: sources, personas, journeys, and priorities.
> Product intent (scope, goals, non-goals) lives in `openspec/prd.md`.
> The backlog is GitHub issues. To build, run `/opsx:propose`; it picks the next open,
> unblocked, unassigned issue.

## Sources

- 2026-09-18 — `/home/andrew/Git/sheets/PRD.md` (Simple Character Sheet Web App). A
  static, installable PWA (Svelte + Vite, Cloudflare Pages) rendering multiple D&D
  character sheets from hand-edited YAML. Philosophy: show stats + trackers + short
  freeform prompts, not a catalog of moves, so a 9-year-old describes actions instead of
  reading options. Live tracking (HP, resource pools) in localStorage; data-provider and
  state-store behind interfaces to allow a future hosted DB.
- Repo state at discovery time: greenfield — only the OpenSpec scaffold and `PRD.md`
  exist; no application code. Every journey stage annotates as `gap` today.
- 2026-09-23 — Conversation request: an **agent skill that ingests a D&D Beyond
  character and walks the author through building a Hero Slate config YAML**. Read the
  sheet, detect whether a config already exists (exists → update drifted values only,
  keep authored structure; new → always emit Identity + Stats + Health, then walk opt-in
  sections: feature pools, spell slots, Your Turn, proficient skills, spell lists), draw
  an ASCII preview, then write the YAML on agreement. Decisions taken this session: fold
  into this discovery as an Author-tooling epic; ingest via the DDB character URL/ID JSON
  API (`character-service.dndbeyond.com`); suggest-and-confirm palette/section colors;
  one pool per spell-slot level; a private character is handled by telling the author to
  set it public and retry.
- 2026-09-24 — Conversation request: an optional, per-character **links section**,
  for example the D&D Beyond character sheet, D&D Beyond spells, or another site used
  during play. Many sheets will have none (a child's sheet probably won't). Decisions
  taken this session: links sit in a "Links" group at the bottom of the sheet; the
  sheet block is a Should; having the ingest skill offer a D&D Beyond link is a
  separate Could story.

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

Stage status checked against the code on 2026-09-24.

**Player journey** (Sunny + Andrew-as-Player):

```
  Find my      Open the     See who      Track in     Restore     Reopen       Use with
  character ─► sheet     ─► I am     ─►  play      ─► after     ─► later     ─► no wifi
     │            │           │            │            │            │            │
  partial     supported   supported    supported    supported    supported       gap
```

1. **Find my character** — deep link `/sunny` works; the picker at `/` is a
   placeholder — partial ([#31](https://github.com/andrewduckett/hero-slate/issues/31))
2. **Open the sheet** — character YAML loads and renders — supported
3. **See who I am** — identity, ability scores, AC/speed/initiative, prompts, links —
   supported (no avatar yet: [#35](https://github.com/andrewduckett/hero-slate/issues/35))
4. **Track in play** — tap HP ±, spend/restore resource pool dots — supported
5. **Restore after** — manual restore via bidirectional taps (no reset button) — supported
6. **Reopen later** — tracking state persisted per device (localStorage) — supported
7. **Use with no wifi** — installed PWA, offline app shell + cached config — gap
   ([#32](https://github.com/andrewduckett/hero-slate/issues/32), [#33](https://github.com/andrewduckett/hero-slate/issues/33))

**Author journey** (Andrew):

```
  Write YAML ─► Commit to ─► Build & ─► Character ─► Deep-link / ─► Iterate
  (char+manifest)  GitHub     deploy     in picker    home-screen     (edits propagate)
      │             │           │           │             │              │
   partial       partial    supported      gap         partial        partial
```

1. **Write YAML** — one file per character — partial. Hand-written YAML works, and
   the D&D Beyond ingest skill ([#36](https://github.com/andrewduckett/hero-slate/issues/36)) builds a new sheet with identity, stats,
   hit points, pools and spell slots, Your Turn, Strengths, and spells. Refreshing
   an existing sheet is the gap ([#41](https://github.com/andrewduckett/hero-slate/issues/41)). The manifest line arrives with the picker
   ([#31](https://github.com/andrewduckett/hero-slate/issues/31)).
2. **Commit to GitHub** — the existing GitHub flow — partial. A push does not deploy;
   CI runs CodeQL only.
3. **Build & deploy** — `npm run deploy` builds static assets and deploys them to
   Cloudflare Workers, with an SPA fallback for clean paths — supported
4. **Character in picker** — manifest drives home cards — gap ([#31](https://github.com/andrewduckett/hero-slate/issues/31))
5. **Deep-link / home-screen** — clean paths work; home-screen install is the gap
   ([#32](https://github.com/andrewduckett/hero-slate/issues/32)) — partial
6. **Iterate** — edits appear on the next open after a deploy, since the sheet
   fetches its YAML each time. Offline copies that refresh in the background are
   the gap ([#33](https://github.com/andrewduckett/hero-slate/issues/33)) — partial

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

- **Sheet restyle + section reorder** ([#27](https://github.com/andrewduckett/hero-slate/issues/27)) — Player: see who I am; the unstyled
  sheet reads worse than the bespoke page it replaces.
- **Palette depth + colour roles** ([#28](https://github.com/andrewduckett/hero-slate/issues/28)) — Player: see who I am; two tokens per
  palette can only fill a shape, so the sheet reads as one hue and a name no longer
  describes its colour.
- **Theme default + toggle** ([#29](https://github.com/andrewduckett/hero-slate/issues/29)) — Player: open the sheet; dark is the wanted
  default and no control exists to switch.
- **Landscape layout** ([#30](https://github.com/andrewduckett/hero-slate/issues/30)) — Player: track in play; the table setup is a tablet
  on its side, and one narrow column wastes the wide axis.

- **D&D Beyond ingest — skeleton + update-in-place** ([#37](https://github.com/andrewduckett/hero-slate/issues/37), [#41](https://github.com/andrewduckett/hero-slate/issues/41); epic [#36](https://github.com/andrewduckett/hero-slate/issues/36),
  added 2026-09-23) — Author: write YAML. The app works with hand-written config, so this is
  not a Must; but hand-authoring a full sheet is the Author's heaviest step and drifts
  stale every level-up. The skeleton (URL → minimal valid sheet) unblocks the epic;
  update-in-place keeps a shipped sheet current without clobbering authored prose.

- **Links section** ([#43](https://github.com/andrewduckett/hero-slate/issues/43); epic [#42](https://github.com/andrewduckett/hero-slate/issues/42), added 2026-09-24) — Andrew-as-Player: track in play. A fuller
  sheet still sends its player to D&D Beyond or another reference mid-session. One tap
  from the sheet saves searching for the right tab. Not a Must: the sheet works without
  it, and Sunny's sheet will usually have no links.

### Could

- Pool number±view fallback for large counts (>12).
- Tap/roll micro-animations and visual polish.
- Install-icon / splash polish beyond the basics.

- **D&D Beyond ingest — richer section mappers** ([#38](https://github.com/andrewduckett/hero-slate/issues/38)–[#40](https://github.com/andrewduckett/hero-slate/issues/40); epic [#36](https://github.com/andrewduckett/hero-slate/issues/36), added 2026-09-23) —
  Author: write YAML. Each opt-in section type (feature pools + spell slots; Your Turn +
  skills; spell lists) is incremental richness on top of the skeleton. Valuable but each
  is a hand-authorable section, so none is a Must.

- **Ingest offers links** ([#44](https://github.com/andrewduckett/hero-slate/issues/44); epic [#42](https://github.com/andrewduckett/hero-slate/issues/42), added 2026-09-24) — Author: write YAML. The ingest skill
  already knows the D&D Beyond character URL, so it can offer that link. It saves a
  line of hand-typing, so it's a Could.

### Won't (this release)

- In-app definition editing; in-app dice rolling; conditions/status; temp HP & death
  saves; cross-device sync/accounts; the hosted DB itself. (These are the v1 non-goals;
  the architecture leaves room for the DB later.)

## Backlog

The backlog is GitHub issues: <https://github.com/andrewduckett/hero-slate/issues>.
Each issue body is a self-contained story packet. Epics are parent issues with
sub-issues, and dependencies are "blocked by" links.

- Epic: D&D Beyond → Hero Slate authoring skill — [#36](https://github.com/andrewduckett/hero-slate/issues/36)
- Epic: Links — [#42](https://github.com/andrewduckett/hero-slate/issues/42)

## Open Questions

- None blocking. Reversible defaults set during the design interview: Svelte (vs Preact),
  `[[d20+3]]` dice delimiter, auto light/dark following the device.
- **Routing approach** (resolve in story 1): SvelteKit + `adapter-cloudflare` vs plain
  Svelte SPA + a micro-router (e.g. navaid/svelte-spa-router). Either satisfies clean
  paths + SPA fallback; pick when scaffolding.
- **Palette definition** (resolve in story 2): the concrete set of color names and their
  light/dark values.
- **Ingest epic — skill location** (resolved in story 16, `dndbeyond-ingest-skeleton`):
  project-level `.claude/skills/dndbeyond-to-slate/`, checked in and travelling with the
  repo. Confirmed working: a freshly started session in this repo lists the skill among
  its available skills.
- **Ingest epic — DDB JSON shape** (resolved in story 16, `dndbeyond-ingest-skeleton`):
  confirmed against Urven's recorded `character-service` v5 response
  (`src/lib/ingest/ddb/fixtures/urven.json`, character 154922980, a public character) and a
  live re-fetch of the same character. `stats`/`bonusStats`/`overrideStats` use ability ids
  1–6 for Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma. Ability bonuses
  carry `statId: null`; only a modifier's `subType` names the ability, as the six
  `<ability>-score` values (for example `dexterity-score`). A `bonus` modifier of that
  subType adds; a `set` modifier of that subType is a floor, applied only when higher than
  the computed score. The same approach carries hit-points-per-level bonuses through the
  `hit-points-per-level` subtype. Monk Unarmored Defense is a `set` modifier with subtype
  `unarmored-armor-class` and `statId: 5` (Wisdom); barbarian Unarmored Defense uses the
  same subtype with `statId: 3` (Constitution) — confirmed for the monk case against
  Urven's real response, and documented from community D&D Beyond tooling for the
  barbarian case and the Armor Class override in `characterValues` (`typeId: 34`), neither
  of which appears in Urven's fixture. See `design.md`'s Decisions (D7, D8) and Risks in
  the `dndbeyond-ingest-skeleton` change for the full mapping and this residual
  uncertainty.
- **Ingest epic — spell data shape** (resolved in story 19 exploration, `spell-list-sections`):
  confirmed against Zip (a level 2 Wizard) and Sunny (a level 6 Circle of the Land Druid,
  character 164521812). `classSpells[]` links to its class through `characterClassId`,
  and that class's `spellCastingAbilityId` gives the casting ability. Spells also arrive
  in the `class`, `race`, and `feat` groups of `spells`, and the same spell can appear
  more than once (Sunny's Pass without Trace appears three times). D&D Beyond's
  `prepared` and `alwaysPrepared` flags are unreliable for granted spells: Sunny's
  Circle of the Land spells show both as false. Cantrip damage scales through each
  damage modifier's `atHigherLevels` steps; healing is a `bonus` modifier of sub-type
  `hit-points`, with `usePrimaryStat` adding the casting modifier.
- **Ingest epic — sheet shape for spells** (resolved in story 19 exploration): two tiers.
  Your Turn keeps 3–4 top choices, including a "Cast a Spell" row with the caster's
  spell attack and DC; a Magic section below holds the chosen spells. The Author's
  guidance: one spell with a DC, one with an attack, and a few flavour spells with no
  numbers, so the child can use her imagination.
- **Recorded fixtures carry no personal data** (resolved 2026-09-23): the recorded D&D
  Beyond responses held the owner's username, avatar, and a campaign roster naming
  other players. The fixtures were blanked, `main` history was rewritten, and new
  fixtures are blanked before they are committed.

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
- 2026-09-23 — Revision: added the **D&D Beyond → Hero Slate authoring epic** (stories
  16–20) serving the Author's "write YAML" stage, from a conversation request. New
  capability run through MoSCoW: skeleton (16) and update-in-place (20) as Should, the
  section mappers (17–19) as Could; the app still ships with hand-written config, so none
  is a Must. Decisions taken: fold into this discovery; ingest via the DDB character
  URL/ID JSON API; suggest-and-confirm colours; one pool per spell-slot level; private
  character → set public and retry. No existing stories renumbered or superseded (the
  epic appends after story 15). Reconciled the checklist: stories 1–9 archived, 10–15
  still unproposed.
- 2026-09-23 — Story 16 (`dndbeyond-ingest-skeleton`) implemented; change linked. Resolved
  both ingest-epic open questions: the skill's location (project-level, checked in) and the
  D&D Beyond JSON shape (ability-score `subType` mapping, Unarmored Defense, and the
  residual uncertainty around the barbarian case and the Armor Class override).
- 2026-09-23 — Follow-up: checked off story 16 on the checklist (missed when the change
  archived) and updated the Author journey map — "Write YAML" moves from `gap` to
  `partial`, since story 16 covers identity/abilities/combat/hit points but not
  pools/sections/spells/update-in-place (stories 17–20). Fixed a stray typo in story 16's
  scope line.
- 2026-09-23 — Story 17 (`feature-pools-and-slots`) implemented; change linked. Updated
  the Author journey note: "Write YAML" stays `partial`, now naming story 17's pools and
  spell slots as shipped alongside story 16's fields, with Your Turn/skills, spells, and
  update-in-place (stories 18–20) as the remaining gaps.
- 2026-09-23 — Follow-up: checked off story 17 on the checklist (missed when the change
  archived, the same gap story 16 had).
- 2026-09-23 — Story 18 (`your-turn-and-skills`) implemented, archived, and checked off on
  the checklist. Updated the Author journey note: "Write YAML" stays `partial`, now naming
  story 18's Your Turn actions section and proficient-skills Strengths section as shipped
  alongside stories 16–17's fields, with spells and update-in-place (stories 19–20) as the
  remaining gaps.
- 2026-09-23 — Story 19 (`spell-list-sections`) explored and proposed; change linked.
  Rescoped the story packet to a two-tier sheet (a "Cast a Spell" row in Your Turn, then
  a recommended Magic section), digest-proven spell numbers, and a sanitized Sunny
  fixture. Recorded the spell data shape, the sheet shape, and the fixture privacy
  cleanup under Open Questions as resolved.
- 2026-09-23 — Story 19 (`spell-list-sections`) implemented. Updated the Author journey
  note: "Write YAML" stays `partial`, now naming story 19's spells — the "Cast a Spell"
  row, the Magic section, and the healing pill — as shipped alongside stories 16–18's
  fields, with update-in-place (story 20) as the remaining gap.
- 2026-09-24 — Revision: added a **links section** from a conversation request.
  Story 21 `links-section` (Should) adds an optional, `https:`-only "Links" group at
  the bottom of the sheet, hidden when a character has none. Story 22
  `ingest-offers-links` (Could) lets the ingest skill offer the character's D&D Beyond
  sheet and, for spellcasters, the D&D Beyond spell compendium. D&D Beyond has no
  stable per-character spells URL. No stories renumbered or superseded. Reconciled the
  checklist: no drift; removed a duplicated `Change` line on story 19.
- 2026-09-24 — Story 21 (`links-section`) implemented; change linked.
- 2026-09-24 — Moved the backlog to GitHub issues. All 22 stories are issues
  #21–#44: 14 shipped stories are closed with a comment naming the PR that shipped
  them; 8 stay open. The two epics are parent issues with sub-issues, and each
  "Depends on" is a blocking link. Removed the story checklist and the scope/goals
  section (`openspec/prd.md` owns those). Refreshed the journey map against the
  code: most player stages are now supported. Stale file paths in the open stories
  were corrected in their issues.
