# PRD: Simple Character Sheet Web App

## 1. Background & Problem

We built a static character sheet so a 9-year-old could join a family Dungeons &
Dragons game (see the current example: <https://static.home.duckett.fun/sunny/> —
"Sunny Thornwood," a level 6 Druid). It works, but it taught us the wrong thing:

- The sheet lists **everything the character *can* do** — spell categories, animal
  forms, cheat sheets, roll formulas.
- She spends more time **reading to understand her options** than **describing what
  she wants to do**. The reference content is *limiting* creative play, not helping it.

The goal of this app is to invert that. The sheet should say, in effect, *"Here's who
you are and what you have — now go describe what you want to do,"* rather than
presenting a menu of legal moves.

## 2. Goals

- Render a **simple** character sheet: ability scores, HP, Armor Class, speed,
  initiative, plus trackable resources (HP and spell-slot-like pools).
- Optimize for **creative play**: minimal reading required to *operate* the sheet.
- Support **multiple characters** (daughter and parent each have one, extensible).
- Be a **static web app** — no backend, no database — deployed to Cloudflare Pages.
- Characters are **file-based config** (YAML) editable directly on GitHub.
- **Don't create traps** for a possible future hosted-database phase.

## 3. Non-Goals (v1)

Explicitly out of scope for the first version:

- In-app editing of character *definitions* (edits happen via YAML on GitHub).
- In-app dice rolling (real dice are used at the table; dice notation is styled only).
- Conditions/status tracking (poisoned, prone, etc.).
- Temporary HP and death saves.
- Cross-device sync / accounts (belongs to the future-DB phase).

## 4. Users & Context

- **Primary operator:** the 9-year-old, **self-driven**, holding the device.
  - Big tap targets, near-zero reading required to operate, kid-readable text.
  - Uses **standard D&D vocabulary** (Hit Points, Armor Class, Initiative, Ability
    Scores, Spell Slots) so it matches the rest of the table and she learns the game.
- **Secondary operator:** the parent, who also plays a character and authors all config.
- **Primary device:** **portrait tablet** (e.g., iPad) at the table. Responsive to
  phone/desktop as a bonus, but tablet-portrait is the design target: single-column
  cards, roomy taps.
- **Connectivity:** table wifi may be flaky → app must work **offline** mid-session.

## 5. Product Overview

A static, installable PWA that:

1. Shows a **home picker** (`/`) — "choose your hero" cards built from a manifest.
2. Renders a **per-character sheet** at a clean, linkable path (`/sunny`), addable to
   the tablet home screen as a full-screen app icon.
3. Lets the operator **track** live state (HP, resource pools) with bidirectional taps,
   persisted per-device.
4. Presents **freeform, config-defined sections** (Your Turn, Strengths, etc.) as
   creative prompts instead of exhaustive rule references.

## 6. Functional Requirements

### 6.1 Character sheet content

Fixed, structured blocks (rendered in this order), then config-defined custom sections.

**Identity (header)**
- `name` (required).
- Optional: `level`, `class`, `race`, `avatar` (emoji **or** image path), `tagline`.
- App formats a consistent identity line (e.g., "Level 6 Druid").
- Optional `story`: freeform rich-text flavor section.

**Ability Scores**
- Author the **score** (e.g., `strength: 16`); the app computes the modifier with
  `floor((score - 10) / 2)`.
- Display the **modifier prominently** (the number she adds to rolls), raw score small.
- All six shown: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma.

**Combat metrics**
- **Armor Class** — authored number.
- **Speed** — authored number.
- **Initiative** — defaults to the **Dexterity modifier**; file may override with an
  explicit value. Labeled "Initiative."

**Hit Points (tracker)**
- Displayed as a large `current / max` readout (e.g., `38 / 45`) plus a slim color bar.
- Tap controls: **−1, −5, +1, +5** (handles arbitrary damage/heal amounts exactly).
- **Bidirectional** (spend and restore); **clamped** to `0..max`.
- At `0`, show a gentle "down" state (no death-save mechanics in v1).
- **No reset button** — restoration is manual (this is intentional; prevents accidental
  full-heal and keeps her in control).

**Resource pools (spell slots / rage / ki / etc.)**
- Config-defined, **rules-agnostic**. Each pool: `{ label, color, max }` (icon optional).
- Rendered as rows of **bidirectional tappable dots** (tap to spend, tap to restore).
- Multiple pools per character supported. Examples the model must cover:
  - Spell slots by level → one pool per level (`Level 1`: 4, `Level 2`: 3, …), **or**
    a single simplified `Magic` pool.
  - Rage → one pool of 3. Ki → one pool of 5. Bardic Inspiration, Sorcery Points, etc.
- For large counts (> 12), a pool may fall back to a number ± view; dots are the default.
- No reset button (consistent with HP); manual restore.

**Custom sections (config-defined)**
- The file declares an **ordered list** of sections. Each section:
  `{ title, color, rows: [ { title, color?, body } ] }`.
- A row is a **titled rich-text row**: colored title on the left, rich text on the right.
- "Your Turn" and "Strengths" are simply the first two authored sections. Future
  sections (Inventory, Notes, Backstory) need **no code changes**.
- **Strengths** guidance: entries are freeform phrases shaped like a skill/ability/action
  ("Sneaking through the forest"), with an **optional** number rendered as a small `+5`
  badge. Section omitted entirely if not authored.

### 6.2 Rich-text markup (for all freeform bodies)

A small, safe markup layer supporting:
- `**bold**`, `*italic*`
- Native emoji
- **Dice tokens**: `[[d20+3]]`, `[[1d8]]` → rendered as a styled `🎲 d20+3` **pill**,
  **non-interactive** (real dice at the table). Explicit `[[…]]` delimiters avoid false
  matches in prose.
- Rendering must be XSS-safe (no raw HTML injection from config).

### 6.3 Color theming

- **Named palette** only (e.g., `forest`, `fire`, `ocean`, `berry`, `sun`, …), each
  tuned for accessible contrast in **both light and dark** modes.
- A character has a theme color; each custom section and row title may pick a palette name.
- No raw hex in v1 (guardrails against unreadable colors).
- Light/dark mode **auto-follows the device**.

### 6.4 Navigation & routing

- Home `/`: picker built from the manifest — large tappable character cards
  (name, color, avatar).
- Per-character page at a **clean path** `/sunny` (SPA fallback on Cloudflare Pages).
- **Logical IDs in URLs** — `/sunny` is an id that resolves to `sunny.yaml` today and a
  DB record tomorrow; the router never references filenames.
- Deep links are bookmarkable and work as home-screen app icons.

### 6.5 State & persistence

- Live tracking state (current HP, spent pool dots) stored in **localStorage**, keyed
  per character id. Survives refresh and tab close. Per-device (no sync in v1).
- **Reconciliation:** stored state is validated against the current definition on load
  (e.g., clamp current HP to new max; adjust pool sizes if `max` changed in config).
- Definition is **read-only** to the app; tracking state is a **separate** store.

## 7. Configuration Format

- **YAML**, hand-edited on GitHub. Comments encouraged.
- **One file per character**: `characters/<id>.yaml`.
- **Manifest**: `manifest.yaml` lists characters (`id`, `name`, `color`, `avatar`) for
  the picker. Adding a character = one new file + one manifest line.

### 7.1 Example character (illustrative)

```yaml
id: sunny
name: Sunny Thornwood
level: 6
class: Druid
race: Wood Elf
avatar: "🦊"
tagline: Friend to every creature in the forest
color: forest

story: |
  Sunny grew up among the trees and can talk to animals...

abilities:
  strength: 10
  dexterity: 14
  constitution: 16
  intelligence: 12
  wisdom: 18
  charisma: 13

armorClass: 15
speed: 35
# initiative omitted -> auto from Dexterity (+2)

hitPoints:
  max: 45

pools:
  - label: Magic
    color: ocean
    max: 6

sections:
  - title: Your Turn
    color: sun
    rows:
      - title: Attack
        body: "Point at a bad guy and roll **[[d20+6]]** to hit! 🔥"
      - title: Help
        body: "Give a friend an *easier* roll."
      - title: Wild Shape
        body: "Turn into an animal 🐺 and get 6 shield HP."
  - title: Strengths
    color: forest
    rows:
      - title: Sneaking
        body: "Move through the forest without a sound 🌲 +7"
      - title: Talking to animals
        body: "You always understand what creatures want."
```

## 8. Architecture (future-proofing for a hosted DB)

The single most important architectural constraint: **don't trap ourselves** before a
possible future hosted database.

- **Data-provider interface**: `listCharacters()`, `getCharacter(id)`. v1 implementation
  fetches YAML; a future implementation calls an API. UI depends only on the interface.
- **State-store interface**: `loadState(id)`, `saveState(id, patch)`. v1 = localStorage;
  future = remote store (also what unlocks cross-device sync).
- **Definition vs. tracking-state** kept strictly separate and independently serializable.
- **Logical IDs** everywhere (URLs, storage keys) — never filenames.
- Stable, serializable schema (YAML → JSON API maps cleanly).

## 9. Tech Stack & Deployment

- **Build:** Vite.
- **Framework:** **Svelte** (small runtime, simple reactivity/stores). Preact is the
  fallback if preferred.
- **Hosting:** Cloudflare Pages (build runs there), with SPA fallback for clean paths.
- **PWA:**
  - App shell cached **cache-first** with a versioned service worker; show an
    "update available — refresh" prompt on new deploys.
  - Character/manifest config cached **stale-while-revalidate** — instant load + offline
    fallback, background refresh so GitHub edits appear without going permanently stale.
  - Web app manifest + icons for "Add to Home Screen."
- **Access:** **public but unlisted** — `noindex`/robots, no exposed directory beyond the
  manifest. Content is low-sensitivity game stats.

## 10. Success Criteria

- A child can, without help and without reading rules text, see her stats, track HP and
  magic during a fight, and restore them afterward.
- Adding or editing a character requires only editing YAML on GitHub; changes appear on
  next online open (offline still works with the last-known copy).
- The sheet contains **no exhaustive spell/ability catalog** — only stats, trackers, and
  short freeform prompts.
- Moving to a hosted DB later requires swapping the data-provider and state-store
  implementations, not rewriting the UI.

## 11. Open Questions / Future

- Cross-device sync + accounts (future hosted-DB phase).
- Optional conditions/status, temp HP, death saves — could arrive as custom sections or
  first-class features later.
- Inventory/currency — expressible today via custom sections; may warrant structure later.
