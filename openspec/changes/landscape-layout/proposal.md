## Why

The tablet is used in landscape about as often as in portrait. At 1280×800, today's 44rem cap leaves a narrow strip down the middle, with most of the screen empty. Every block stacks into a page about twice the screen's height, so hit points and "Your Turn" are never on screen together. The restyle and palette work have shipped, so the layout can change now without colliding with them.

## What Changes

- On a viewport at least 1024 CSS pixels wide, the sheet shows two columns under a full-width header (D1, D2). The left column holds Stats, Health and Pools. The right column holds the sections, then Links.
- If one column has nothing to show, the other spans the full width (D8). Sections never move into the left column, even when the right column runs longer (D7).
- On wide screens, the sheet's content cap grows past 44rem (D9). The home picker (`/`) keeps its current width (D10).
- Ability and combat tiles use a fixed number per row, never `auto-fit` (D5). In two columns, abilities sit 3 per row; at portrait tablet width, 6; at phone width, 3. Combat sits 3 per row everywhere. For the usual 6 abilities and 3 combat entries, no tile sits alone on a row (D6).
- Below 1024 CSS pixels, the sheet looks as it does today (D3). Reading and focus order do not change at any width (D4).
- Not in this change: any promise about what sits above the fold, the home picker's layout (#31), and new blocks, data fields, colour tokens or tracker behaviour.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `character-sheet`:
  - "Sheet block order" describes order across a multi-column layout, not "top to bottom".
  - A new requirement covers the two-column layout on wide screens, with reviewer scenarios at 1280×800 for `/sunny`, `/urven` and `/gimdak` (D11, D12).
  - "Sheet fits a phone screen" describes fixed tile counts instead of wrapping.

## Impact

- **Code:**
  - `src/lib/CharacterView.svelte` (the `article` grid and its groups).
  - `src/lib/theme/base.css` and `src/routes/+layout.svelte` (the `.page` cap, which also wraps `/`).
  - `src/lib/character/AbilitiesBlock.svelte` and `CombatBlock.svelte` (the `auto-fit` grids).
- **Possibly:** `ResourcePoolsBlock.svelte` and `SectionsBlock.svelte`, if their layouts need adjusting inside a narrower column.
- **Tests:** jsdom computes no layout, so a reviewer checks column placement and tile rows in a browser. Unit tests can still check the DOM order and the column assignment of each group.
- **Dependencies, data and APIs:** no change. Character YAML, the provider, the theme tokens and per-device state are untouched.
