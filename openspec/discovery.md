# Discovery: Simple Character Sheet Web App

> The living map behind the backlog: who the product serves and the journeys it supports.
> Product intent (scope, goals, non-goals) lives in `openspec/prd.md`.
> Stories are GitHub issues; each discovery run's scope and decisions live in its parent issue.
> To build, run `lets-build`; it picks the next open, unblocked, unassigned issue.

## Personas

### People who use Hero Slate

#### Sunny — the Kid Player (9)

- **Who**: the 9-year-old at the table, holding her own tablet.
- **Goal**: know who her character is and track HP/magic during play *without reading
  rules*, so she can focus on describing what she wants to do.
- **Pain today**: the current sheet is a wall of spells/forms/formulas; she reads to find
  options instead of imagining them.
- **Success looks like**: opens her sheet, spends/restores HP and gems with taps, glances
  at a prompt, narrates an action — no adult decoding required.

#### Andrew-as-Player — the Parent playing their own character

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

### People who build Hero Slate

#### Andrew — the Parent Author/DM

- **Who**: the parent who runs the game, authors every character, and deploys the site.
- **Goal**: create/adjust characters by editing YAML on GitHub and have it live for
  everyone, with room to grow toward a hosted DB later.
- **Pain today**: the current sheet is bespoke HTML per character — no reuse, no
  multi-character story, hand-maintained.
- **Success looks like**: adds a character with one file + one manifest line; edits land
  on next online open; never boxed out of a future backend.

## Journey Map

Stage status checked against the code on 2026-10-29.

### People who use Hero Slate

**Player journey** (Sunny + Andrew-as-Player):

```
  Find my      Open the     See who      Track in     Restore     Reopen       Use with
  character ─► sheet     ─► I am     ─►  play      ─► after     ─► later     ─► no wifi
     │            │           │            │            │            │            │
  supported   supported   supported    supported    supported    supported     partial
```

1. **Find my character** — `/` lists the characters as cards, deep links like `/sunny`
   work, and a sheet can be added to the home screen as a full-screen icon — supported
2. **Open the sheet** — character YAML loads and renders — supported
3. **See who I am** — identity, avatar, ability scores, AC/speed/initiative, prompts,
   links — supported
4. **Track in play** — tap HP ±, spend/restore resource pool dots; a pool with more than
   12 uses shows a counter instead of dots — supported
5. **Restore after** — manual restore via bidirectional taps (no reset button) — supported
6. **Reopen later** — tracking state persisted per device (localStorage) — supported
7. **Use with no wifi** — the installed app opens full-screen, but there is no offline
   app shell or cached character data — partial
   ([#33](https://github.com/andrewduckett/hero-slate/issues/33))

### People who build Hero Slate

**Author journey** (Andrew):

```
  Write YAML ─► Commit to ─► Build & ─► Character ─► Deep-link / ─► Iterate
  (char+manifest)  GitHub     deploy     in picker    home-screen     (edits propagate)
      │             │           │           │             │              │
   partial      supported   supported   supported     supported       partial
```

1. **Write YAML** — one file per character, plus one line in the character manifest —
   partial. Hand-written YAML works, the D&D Beyond ingest skill builds a new sheet with
   identity, stats, hit points, pools and spell slots, Your Turn, Strengths, and spells,
   and the avatar skill makes a character's avatar. Refreshing an existing sheet is the
   gap ([#41](https://github.com/andrewduckett/hero-slate/issues/41)).
2. **Commit to GitHub** — every pull request runs the tests and the build in CI, and a
   push to `main` deploys the site — supported
3. **Build & deploy** — the build makes static assets, served from Cloudflare Workers
   with an SPA fallback for clean paths — supported
4. **Character in picker** — the character manifest drives the home page's cards —
   supported
5. **Deep-link / home-screen** — clean paths work, and any page can be added to the
   home screen — supported
6. **Iterate** — edits appear on the next open after a deploy, since the sheet
   fetches its YAML each time. Offline copies that refresh in the background are
   the gap ([#33](https://github.com/andrewduckett/hero-slate/issues/33)) — partial

## Backlog

Stories are GitHub issues: <https://github.com/andrewduckett/hero-slate/issues>.
