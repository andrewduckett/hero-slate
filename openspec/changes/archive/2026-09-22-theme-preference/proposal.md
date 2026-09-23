## Why

The sheet follows the device's light or dark setting and gives the player no control. A player who wants the other mode must change a device setting to get it. At the table we want dark by default, and today nothing makes dark the resting default or lets a player switch on the page.

## What Changes

- Dark is the resting default: the sheet renders dark whenever no stored choice applies and no `prefers-color-scheme` query matches. Current browsers usually report `light` for a device that never set a preference, so in practice the dark base shows in the prerendered shell and in a browser that does report no preference.
- The sheet still follows a device that states a light or dark preference, until the player chooses a mode.
- A control on every route switches the sheet between light and dark by hand.
- A player's chosen mode persists per device across reloads, in one global stored value.
- A `data-theme` selector renders a chosen mode; the device media query still drives the sheet until a player chooses.
- The prerendered shell sets the mode before first paint, so the wrong mode never flashes.
- **BREAKING (constraint reversal):** light/dark is no longer a pure `prefers-color-scheme` media query with no toggle. This reverses a durable constraint in `AGENTS.md` and in discovery stories 2 and 7. This change amends that wording in all three places.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `theming`: This change removes the `Automatic light and dark` requirement and adds requirements for the dark default, the device-follows-until-a-choice behavior, the manual toggle, the persistent per-device choice, the no-flash guarantee, and contrast on the chosen-mode selector path.

## Impact

- **Code:** `src/lib/theme/generate.ts` and the generated `palette.css` — emit a dark base, a `prefers-color-scheme: light` override, and `data-theme` paths for both modes and every accent. `src/app.html` — an inline pre-paint script. `src/routes/+layout.svelte` — the toggle control. A new theme-preference module and its one global storage key.
- **Tests:** three emitted-CSS tests assume the old light-first, dark-in-`@media` layout and must be reworked: `src/lib/theme/emitted-css.test.ts`, `src/lib/theme/generate.test.ts` (it asserts a dark `@media` block exists), and `src/lib/theme/tightest-ratios.test.ts` (it derives its dark scope from that marker). New tests cover the toggle, the preference module, and the inline script.
- **Docs:** amend the no-toggle wording in `AGENTS.md` and in discovery stories 2 and 7; amend discovery story 9's storage wording to match ADR 0008 (a global key, not the character-state store).
- **Not touched:** the `character-state` store. The mode is a global device preference, not per-character tracking state, so it uses its own global key (see ADR 0008).
