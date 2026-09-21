# Tasks — palette-depth

> **Gate override.** The schema blocks this artifact while the latest verdict is
> REVISE. Round 3 returned REVISE, and every one of its findings is fixed in
> `9443cd8`. The user directed the author to proceed to tasks on 2026-09-20.
> `review.md` is left exactly as the reviewer issued it. Re-run the review before
> merge if you want a clean verdict on the record.

Work the groups in order. Group 2 writes failing tests before Group 3 fills the values,
so the suite proves each value rather than trusting it. `design.md` holds the values and
the call sites; `specs/theming/spec.md` holds the rules.

## 1. Extend the token contract

- [x] 1.1 Add `tint` and `deep` to the `Palette` interface and `structural` to `Base` in `src/lib/theme/palette.ts`, each a `ModePair`. Verify `npx tsc --noEmit` reports errors only for the six palette entries that now lack the new fields, and none in unrelated files.
- [x] 1.2 Fill `forest` and the `structural` base value only, using the light and dark tables in `design.md` D3. Leave the other five names incomplete on purpose. Verify the module compiles and `npm test` still runs.
- [x] 1.3 Emit `--tint`, `--deep`, and `--structural` from `src/lib/theme/generate.ts`, inside the per-palette and per-mode blocks it already writes. Verify `src/lib/theme/generate.test.ts` asserts each new custom property appears in both the light block and the dark block.
- [x] 1.4 Run `npm run generate:palette` and verify `src/lib/theme/palette.css` now carries `--tint` and `--deep` under every `[data-palette=...]` selector and `--structural` under `:root`, in both modes.

## 2. Write the contrast rules as failing tests

- [x] 2.1 Add assertions to `src/lib/theme/emitted-css.test.ts` for the foreground on every tint, the muted text on every tint, and each palette's `deep` on its own tint, at 4.5:1 in both modes. Verify they pass for `forest` and fail for the five unfilled names.
- [x] 2.2 Add assertions for each palette's `deep` on the surface and on the raised surface at 4.5:1 in both modes. Verify the same pass/fail split.
- [x] 2.3 Add the separation assertion: every palette's tint against the raised surface at 1.2:1 or more, in both modes. Verify a deliberately near-identical tint fails it, then restore the real value.
- [x] 2.4 Add assertions for `structural` on the surface and on the raised surface at 4.5:1 in both modes. Verify both pass with the value from task 1.2.
- [x] 2.5 Retarget the two existing accent-as-text assertions to `deep`: accent on the surface at `emitted-css.test.ts:65`, and accent on the raised surface at `:96`. Verify no assertion anywhere still requires an accent to be readable as text.

## 3. Fill and prove the remaining values

- [x] 3.1 Fill `fire`, `ocean`, `berry`, `sun`, and `neutral` with the light and dark values from `design.md` D3, and warm `raised` to `#fffdf6`. Verify `npm test` passes every assertion added in Group 2.
- [x] 3.2 Verify the suite reports the expected tightest results, so a later retune cannot silently erode the margin: dark `forest` muted-on-tint at 4.71:1, light `fire` deep-on-tint at 5.33:1, light `fire` tint-on-raised at 1.21:1.

## 4. Add colour roles

- [x] 4.1 Add a role module defining the four roles and their palette names — health to `fire`, armor to `ocean`, speed to `forest`, initiative to `sun` — as stated in `design.md` D4. Verify a unit test asserts each role resolves to a name in `PALETTE_NAMES`.
- [x] 4.2 Implement label matching for the three combat roles: compare an authored label against that role's label list, ignoring case and leading or trailing whitespace. Verify unit tests cover an exact match, a differing case, a padded label, and that no label appears in two role lists.
- [x] 4.3 Implement the fallback: a combat entry matching no role resolves to the character's palette. Verify a unit test renders a `Carrying Capacity` entry on a `forest` character and asserts the forest palette, with the label and value still shown and no error raised.
- [x] 4.4 Wire `CombatBlock.svelte` to set `data-palette` per entry from its resolved role. Verify a component test renders Sunny's three entries and asserts armor is `ocean`, speed is `forest`, and initiative is `sun`, on a `forest` character.
- [x] 4.5 Wire `HitPointsBlock.svelte` to the health role. Verify a component test asserts the tracker carries the `fire` palette for both a `forest` and a `neutral` character.

## 5. Apply the tokens

- [ ] 5.1 Move all six accent-as-mark call sites to `var(--deep)`, listed in `design.md` D5: `AbilitiesBlock:62`, `SectionsBlock:77`, `RichText:33` and `:28`, `HitPointsBlock:139` and `:183`. Verify a grep for `var(--accent)` across `src/` returns only fills and backgrounds, never a `color` or `border` declaration.
- [ ] 5.2 Replace the dice pill's `color-mix(in srgb, var(--accent) 45%, transparent)` border with a solid `var(--deep)` and give the pill a `var(--tint)` fill. Verify `RichText.test.ts` passes and no `color-mix` remains in a component that carries text.
- [ ] 5.3 Restyle pool dots: an unspent dot is a `var(--tint)` fill inside a `var(--deep)` ring, and a spent dot is transparent inside a `var(--structural)` ring. Verify `ResourcePoolsBlock.test.ts` still asserts the filled and empty states by `data-pool-dot`.
- [ ] 5.4 Restyle section cards to a `var(--tint)` title strip with a `var(--deep)` title, replacing the solid accent strip. Verify `SectionsBlock.test.ts` passes unchanged.
- [ ] 5.5 Restyle ability tiles to a `var(--structural)` border with a `var(--deep)` modifier. Verify `AbilitiesBlock.test.ts` passes unchanged.
- [ ] 5.6 Restyle the hit points tracker: a `var(--tint)` bar track and a `var(--deep)` ring, keeping the accent fill. Verify `HitPointsBlock.test.ts` passes unchanged, including the progress role values and the calm state at zero.

## 6. Verify the whole change

- [ ] 6.1 Run `npm test` and confirm all 26 files and every added assertion pass.
- [ ] 6.2 Run `npm run build` and confirm it completes and writes `./build`.
- [ ] 6.3 Open `/sunny` and `/urven` in the dev server in both light and dark mode. Confirm each sheet shows more than one hue, that the tracker reads red on both characters, and that no text or border has become hard to read.
- [ ] 6.4 Confirm `sunny.yaml` and `urven.yaml` are unchanged, since this change adds no character data field.
