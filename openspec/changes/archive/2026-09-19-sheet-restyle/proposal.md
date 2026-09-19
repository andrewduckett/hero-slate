## Why

The character sheet works, but it has almost no styling. It uses the browser's
default serif font, the header runs edge to edge, and blocks sit against the left
edge with no spacing. The bespoke page it replaces (`static.home.duckett.fun/sunny/`)
looks far more polished. A child reads this sheet at the table, so it should be
inviting and easy to scan. We do this now, before the home picker, so the picker's
cards can reuse the new card style.

## What Changes

- Give every existing block a new visual design. The look is warm and chunky, with
  rounded cards, clear spacing, and large type for the numbers a player glances at.
- Reorder the blocks to match the bespoke page: header, stats, hit points
  tracker, pools, then custom sections. Stats means the ability tiles followed by
  the combat tiles.
- Add three short group headings: "Stats" above the ability and combat tiles,
  "Health" above the hit points tracker, and "Pools" above the pools. A heading
  appears only when its group has something to show.
- Show ability scores as tiles with a large modifier and a small raw score.
- Show combat values (Armor Class, Speed, Initiative) as solid accent tiles.
- Restyle the hit points tracker. It gets a large readout, a thick bar, and large
  round buttons, with damage controls on the left and heal controls on the right.
- Restyle pool dots and custom sections as cards with a colored title strip.
- Add two base color tokens: a raised card surface and a muted text color. Both
  meet WCAG AA contrast in light and dark mode.
- Serve a display font and a body font from the site itself. The page makes no
  request to a third-party font service.
- Move Sunny's "Strengths" section before "Your Turn" in `sunny.yaml`, to match the
  bespoke page. This is a data edit, not a code change.

Out of scope: new data fields (story, quote, callout, spell and animal cards),
changes to how the trackers behave, and a light/dark toggle.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `character-sheet`: adds a fixed order for the blocks, group headings, the hit points
  control order, and phone-width layout rules.
- `theming`: adds the raised surface and muted text tokens with their contrast
  rules, requires every accent to stay readable on the raised surface, and requires
  fonts to be self-hosted.

## Impact

- **Components:** `src/lib/CharacterView.svelte` (block order and header) and every
  block in `src/lib/character/`. `src/lib/richtext/RichText.svelte` may get small
  spacing changes.
- **Theme:** `src/lib/theme/palette.ts`, the generator, the generated `palette.css`,
  and the contrast tests.
- **Assets:** new `static/fonts/*.woff2` files and their licence files. Cloudflare
  Workers static assets serve them as plain files. The change adds no Worker code.
- **Data:** `static/characters/sunny.yaml` (section order only).
- **Behavior:** no change to data loading, validation, state storage, or tracker
  logic. Existing behavior tests must still pass unchanged.
