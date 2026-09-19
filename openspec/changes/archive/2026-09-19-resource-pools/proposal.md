## Why

Players can track hit points, but they cannot yet track limited character abilities.
Resource pools add simple, rules-agnostic counters for magic, Wild Shape, rage, ki, and similar uses.

The existing state store already keeps player changes separate from authored character data.
This story reuses that boundary for the second tracker in the release plan.

## What Changes

- Add authored, ordered resource-pool definitions with stable ids, labels, palette names, and maximum uses.
- Render each valid pool as a row of remaining-use dots.
- Let a player tap any dot to set the remaining uses directly.
- Save pool counts per character and per device through the existing state-store interface.
- Start a missing or invalid stored count at the authored maximum.
- Clamp stored counts when an author changes a maximum, and save the corrected count.
- Hide the tracker when no valid pools are authored.

This change does not add reset buttons, rest rules, dice rolling, or the large-pool number control.

## Capabilities

### New Capabilities

- `resource-pools`: Define, resolve, render, adjust, and persist rules-agnostic resource pools.

### Modified Capabilities

- None.

## Impact

- Extends the character definition's provisional `pools` field with a defined authoring contract.
- Adds pool domain code and a sheet component under `src/lib/character/`.
- Extends the route and character view to load the `pools` tracker state with hit-point state.
- Reuses the existing `StateStore` under the tracker key `pools`; it adds no dependencies or backend work.
