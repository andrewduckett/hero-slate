## Context

See proposal.md — Why. Two facts shape the approach:

- The provider carries `abilities` and `combat` as loosely-typed pass-through
  fields. It validates identity only. This follows ADR-0002: the provider holds
  no domain meaning.
- Theming already shows the pattern to copy. `resolvePalette` reads an authored
  string and falls back to a safe default, so a bad value never breaks a sheet.
  A stat resolver mirrors this.

The sheet today renders only the identity header in `CharacterView.svelte`.

## Goals / Non-Goals

**Goals:**

- Render an abilities block and a combat block, each in its own visual style.
- Compute the ability modifier from a score, and let the author override it.
- Keep all labels and values author-driven, with no D&D structure assumed.
- Tolerate malformed data without throwing.

**Non-Goals:**

- No per-device state and no interaction — that starts with the HP tracker.
- No custom rich-text sections — that is a later story.
- No provider change — the domain layer owns this data's meaning.

## Decisions

### Resolve stat data in a domain layer, not the provider

A new module under `src/lib/character/` turns the loosely-typed `abilities` and
`combat` fields into render-ready lists. It mirrors `resolvePalette`: read
authored data, coerce it, fall back safely, never throw.

Alternative: promote `abilities`/`combat` to typed fields the provider validates.
Rejected — it couples the provider to D&D semantics, which ADR-0002 keeps out.

### One entry shape; the list drives behavior and style

Every entry is `{ label, value, modifier? }`. The list an entry sits in decides
the rest. An entry under `abilities` gets a computed modifier and the ability
style. An entry under `combat` shows its value plainly, in a different style.

Alternative A: a distinct key per list (`score` vs `value`). Rejected — two
near-identical shapes with a different key for "the number" is an authoring
footgun. A hand-author writes the wrong key and the entry silently fails.

Alternative B: one merged list with a per-entry style flag. Rejected — two lists
cleanly express the two styles, and the author does not mind the split.

### Compute the modifier, allow an override

The domain layer computes `floor((value - 10) / 2)` and shows it signed. An
authored `modifier` overrides it. This is the same compute-by-default,
file-override pattern the packet used for initiative.

Alternative A: always compute, no override. Rejected — a homebrew modifier
becomes inexpressible.

Alternative B: author writes every modifier. Rejected — it hands repeated
arithmetic to the author and lets the score and modifier drift, so a wrong number
reaches the child's sheet.

### Author-driven labels; drop the packet's D&D structure

Labels are authored strings. The app assumes no fixed six abilities, no default
labels, and no automatic initiative-from-Dexterity. The author types initiative
like any other combat value.

Rationale: the fixed keys were rigid structure worth removing. The modifier
formula is a small, defensible convenience that keeps score and modifier in sync,
so it stays. This trades a little D&D knowledge in one function for far less
rigidity overall.

### Values render verbatim; sign a value by authoring a string

A combat value renders as text: a string verbatim, a finite number as its parsed
value, and anything else as an em dash. To show a sign, the author writes a string
such as `"+2"`. Computed ability modifiers are always signed.

Alternative: per-value format flags. Rejected as overkill for a hand-authored
file.

## Risks / Trade-offs

- **A typo'd label or value renders as typed** → The file is hand-authored with a
  small blast radius, and the resolver still never throws. Acceptable for this
  release.
- **`value` is the prominent number in combat but the small one in abilities** →
  `value` consistently means "the number you type"; the block decides what is
  prominent. Documented so authors are not surprised.
- **The author keeps score and modifier consistent only when overriding** → The
  default computes the modifier, so the common case cannot drift; the override is
  opt-in.

## Migration Plan

- Migrate `static/characters/sunny.yaml` from its current `abilities`/`combat`
  maps to the two lists in this same change, so the deployed sheet renders.
- No persisted state exists to migrate — the sheet is a pure render.
- Rollback is a revert; nothing is stored per device.

The two blocks read as distinct visual treatments. The abilities block is a grid
of cells, each with the modifier large and the raw score small beneath it. The
combat block is a plainer list of label-and-value pairs with the value prominent.
This description is the durable visual reference and guides implementation, not the
spec. (The author's private deployment shows the intended styling, but it is not
reachable from the repo or CI, so it is optional context only.)
