## 1. Color tokens

- [x] 1.1 Write failing tests in `palette.test.ts` and `emitted-css.test.ts`. They check that `raised` and `muted` exist in both modes as opaque `#rrggbb` values. They also check that the emitted `--raised` and `--muted` meet 4.5:1 for foreground on raised, muted on surface, and muted on raised. Verify the new tests fail.
- [x] 1.2 Write a failing test that every palette accent meets 4.5:1 on the emitted raised surface in both modes. Verify it fails.
- [x] 1.3 Add `raised` and `muted` to `Base` and `BASE` in `palette.ts`, and set the light `surface` to `#f7f2e8`, per design D3. Update `generate.ts` to emit `--raised` and `--muted`. Run `npm run generate:palette`. Verify the tests from 1.1 and 1.2 pass.
- [x] 1.4 Darken the light-mode `forest` accent until it reaches at least 4.8:1 on the surface. Keep its hue. Verify with the contrast tests, then run `npm test` and confirm the whole suite is green.

## 2. Self-hosted fonts

- [x] 2.1 Write a failing test that reads `src/lib/theme/fonts.css`. It asserts that every `@font-face` source is a root-relative `/fonts/` path and names no other host. It also asserts that each face sets `font-display: swap`, and that each `.woff2` file and its `OFL.txt` exist in `static/fonts/`. Verify it fails.
- [x] 2.2 Download the latin-subset variable `.woff2` files for Baloo 2 and Nunito from Fontsource, with each family's `OFL.txt`, into `static/fonts/`. Verify the files exist and their licences are SIL OFL 1.1.
- [x] 2.3 Write `src/lib/theme/fonts.css` with the `@font-face` rules. Add `src/lib/theme/base.css` with `--font-display`, `--font-body` (each with a `system-ui, sans-serif` fallback), a spacing scale, radii, a shadow, and the centered page container. Base.css holds no color tokens; only the decorative shadow names a color. Import both files in `src/routes/+layout.svelte`. Verify the test from 2.1 passes.
- [x] 2.4 Run `npm run build` and verify that `build/fonts/` contains both `.woff2` files and both `OFL.txt` files.

## 3. Block order and group headings

- [x] 3.1 Write failing tests in `CharacterView.test.ts` for the "Sheet block order" requirement. Use `data-block` attributes and document position. Cover the full order, a missing hit points tracker, and abilities before the tracker. Verify they fail.
- [x] 3.2 Write failing tests for the "Group headings" requirement. Cover "Stats", "Health", and "Pools" in order, no "Health" heading without hit points, and a "Stats" heading with only combat entries. Verify they fail.
- [x] 3.3 Reorder the blocks in `CharacterView.svelte`, add the `data-block` attributes, and render each group heading only when its group renders. Verify the tests from 3.1 and 3.2 pass, and that every existing `CharacterView` test still passes unchanged.
- [x] 3.4 Write a test that the hit points controls appear in the order -5, -1, +1, +5. Verify it passes against the current markup, and keep it as a regression guard.

## 4. Restyle the blocks

- [x] 4.1 Restyle the identity header as a rounded accent card with the name in the display font, per design D1. Verify the existing header and theming tests still pass.
- [x] 4.2 Restyle `AbilitiesBlock.svelte` as raised tiles with an accent top border, a large modifier, and a muted label and score. Replace `opacity` with `--muted`. Verify the `AbilitiesBlock` tests still pass.
- [x] 4.3 Restyle `CombatBlock.svelte` as solid accent tiles with on-accent text. Verify the `CombatBlock` tests still pass.
- [x] 4.4 Restyle `HitPointsBlock.svelte` per design D2: a large readout, a thick rounded bar, and round buttons in two groups. Damage buttons are outlined and heal buttons are filled with accent. Replace the `color-mix` fill with tokens and keep the 0 hit points dim. Verify the `HitPointsBlock` tests still pass.
- [x] 4.5 Restyle `ResourcePoolsBlock.svelte` as a raised card with chunky dots and a tap target of at least 44 by 44 CSS pixels. Verify the `ResourcePoolsBlock` tests still pass.
- [x] 4.6 Restyle `SectionsBlock.svelte` as raised cards with the accent title strip on top. Rows stack below about 30rem and sit side by side above it. Check that `RichText.svelte` pills still read well on the raised surface. Verify the `SectionsBlock` and rich-text tests still pass.
- [x] 4.7 Search the restyled blocks for `color-mix` and `opacity`. Confirm that no text color or background behind text or a control uses blending, apart from the 0 hit points dim and decorative lines or shadows.

## 5. Data and verification

- [x] 5.1 Move the "Strengths" section before "Your Turn" in `static/characters/sunny.yaml`. Verify that `/sunny` shows Strengths first in `npm run dev`.
- [x] 5.2 Open `/sunny` and `/urven` in a browser 360 CSS pixels wide, in light and dark mode. Confirm there is no sideways scrolling, the ability tiles wrap, each hit points control and pool dot is at least 44 by 44 CSS pixels, and the fonts load from the site itself. Save screenshots for the PR.
- [x] 5.3 Run `npm test` and `npm run build`. Confirm both are green before opening the implementation PR.
