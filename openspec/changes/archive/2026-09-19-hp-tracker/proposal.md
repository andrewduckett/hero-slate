## Why

A player must track hit points during play. The sheet renders identity and stats
today, but nothing changes when a character takes damage or heals. Hit points are
the first mutable value in the app. Tracking them introduces the state store
interface. That interface is the second half of the "no future-DB traps" safety,
alongside the data provider.

## What Changes

- Add a state store interface: read and write per-device state by a character's
  logical id and a tracker key. Values are opaque JSON.
- Add a localStorage implementation of the interface. Its key layout maps to a
  future `(owner, character_id, key)` database record, where the owner comes from
  the signed-in account, not from the interface.
- Add an HP domain resolver that combines the authored `max` with the stored
  `current`, clamps `current` to `0..max`, and reconciles a stored value against a
  changed `max` on load.
- Render an HP tracker on the sheet: a `current / max` readout, a slim bar, and
  `-5 / -1 / +1 / +5` buttons. Taps clamp to `0..max` and persist.
- Show a calm "down" state at 0 HP — dimmed, not alarming.

## Capabilities

### New Capabilities

- `character-state`: a per-device state store behind an interface. It reads and
  writes JSON state keyed by a character's logical id and a tracker key, keeping
  mutable state separate from the authored definition.

### Modified Capabilities

- `character-sheet`: add HP-tracker requirements — resolve authored hit points
  against stored current HP, render the tracker, and persist taps.

## Impact

- New code: `src/lib/state/store.ts` (interface), `src/lib/state/localStorage.ts`
  (implementation), `src/lib/character/hitPoints.ts` (resolver), an HP component.
- Modified: `CharacterView.svelte` renders the HP tracker.
- Data: the provider keeps carrying `hitPoints` through unresolved; the HP
  resolver in the sheet interprets it, so no provider change is needed. The
  definition supplies `max`; `current` is store-only state, not a definition field.
- No backend, no new dependencies. State stays per-device in localStorage.
