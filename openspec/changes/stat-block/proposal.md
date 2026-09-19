## Why

Today the sheet shows only a name and a "Level X Class" line. A player cannot
see her ability scores or her combat numbers, so the at-a-glance "who I am"
picture is incomplete. This change fills in that static picture. It stays a pure
render with no interaction, which keeps the story small and unblocks the
trackers that come next.

## What Changes

- Render an **abilities** block. Each entry shows a prominent, signed **modifier**
  and a small raw score.
- Render a **combat** block in a visibly different style. Each entry shows a
  labeled number as authored.
- Compute the ability modifier with a pure function, `floor((value - 10) / 2)`.
  An authored `modifier` on an entry overrides the computed one.
- Read `abilities` and `combat` as ordered lists of `{ label, value, modifier? }`.
  The list an entry sits in decides its behavior and its style: an entry under
  `abilities` gets a computed modifier and the ability style; an entry under
  `combat` shows its value plainly.
- Resolve this loosely-typed provider data in a domain layer that never throws.
  Render exactly the entries the author lists, in order. Drop an entry with no
  label. Hide a block when its list is empty. Show a dash for a missing score.
- Migrate `static/characters/sunny.yaml` from its current key-value maps to the
  two lists, so the deployed sheet renders under the new shape.

This change deliberately supersedes three details from the story packet. It drops
the fixed six abilities, the built-in default labels, and the automatic
initiative-from-Dexterity calculation. All labels and combat values are now
author-driven, and initiative is authored like any other combat number. None of
these were ever implemented, so nothing shipped breaks. The product owner (Andrew)
reviewed and accepted this supersession on 2026-09-19, and in the same session
chose to add an optional authored `modifier` override on an ability — a deliberate
product decision, not the packet's initiative-only override.

## Capabilities

### New Capabilities

<!-- None. This extends the existing character-sheet capability. -->

### Modified Capabilities

- `character-sheet`: adds requirements for rendering an abilities block with a
  computed-or-overridden modifier, rendering a distinct combat block, and
  resolving both from loosely-typed data without throwing.

## Impact

- **New domain module** under `src/lib/character/` — the pure modifier function
  and the normalizers that turn provider data into render-ready lists.
- **New stat-block components** rendered under the identity header in
  `src/lib/CharacterView.svelte`.
- **Data migration** of `static/characters/sunny.yaml` to the `abilities` and
  `combat` lists.
- **No provider change.** `abilities` and `combat` stay provisional pass-through
  fields; the domain layer owns their meaning. No per-device state, no
  interaction.
