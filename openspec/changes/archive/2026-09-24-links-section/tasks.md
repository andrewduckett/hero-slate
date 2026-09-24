## 1. Resolver

- [x] 1.1 Add `links?: unknown` to `Character` in `src/lib/types.ts`, with a doc comment that points at `resolveLinks`; verify `npm run check` reports no new errors beyond the known `node:fs`/`process` noise.
- [x] 1.2 Write failing tests in `src/lib/character/links.test.ts` for which links are kept: a missing or non-list `links`, an `https:` link kept, and `javascript:`, `http:`, `data:`, relative, malformed, `user:secret@`, `user@`, bare-string, and no-`url` entries dropped, with valid links around a dropped one keeping their order; verify the tests fail.
- [x] 1.3 Write failing tests in `links.test.ts` for labels and colour: emoji and markup kept as written, a missing, blank, or non-string label falling back to the hostname, a missing `color` using the character's palette, an own `color` used, an unknown `color` resolving to `neutral`, duplicates kept, and `href` equal to the normalised URL; verify the tests fail.
- [x] 1.4 Implement `resolveLinks(links, characterPalette)` in `src/lib/character/links.ts` per design D1; verify every test in `links.test.ts` passes.

## 2. Links block

- [x] 2.1 Write failing tests in `src/lib/character/LinksBlock.test.ts`: one chip per kept link in authored order; each anchor has `target="_blank"` and `rel="noopener noreferrer"`; each chip carries `data-palette`; an HTML label renders as literal text with no `em` element; the arrow has `aria-hidden="true"`; the accessible name includes the label and "opens in a new tab"; no valid links renders nothing. Verify the tests fail.
- [x] 2.2 Implement `src/lib/character/LinksBlock.svelte` with props `links: unknown` and `palette: PaletteName`, per design D2 and D3; verify every test in `LinksBlock.test.ts` passes.
- [x] 2.3 Style the chips: a wrapping flex row, `--deep` text on `--tint`, `min-height: 44px`, a pill radius, and a visible `:focus-visible` outline; verify in `npm run dev` that chips wrap on a 360px-wide viewport with no sideways scroll and measure at least 44px tall.

## 3. Sheet integration

- [x] 3.1 Write failing tests in `src/lib/CharacterView.test.ts`: the links group renders after the last section; the "Links" heading appears after "Pools" and directly before the chips; a character with only dropped links, or no `links` key, shows no "Links" heading. Verify the tests fail.
- [x] 3.2 Render the links group in `src/lib/CharacterView.svelte`: add a `hasLinks` check, the "Links" heading, and `LinksBlock` after `SectionsBlock`, and update the block-order comment to name the links group; verify the tests from 3.1 pass.
- [x] 3.3 Add example links to `static/characters/urven.yaml` (the D&D Beyond sheet and the spell compendium) and leave `sunny.yaml` unchanged; verify in `npm run dev` that `/urven` shows the chips and each opens in a new tab, and that `/sunny` shows no "Links" heading.

## 4. Verification and plan

- [x] 4.1 Run `npm test` and `npm run build`; verify both finish green.
- [x] 4.2 Update story 21 in `openspec/discovery.md`: set its `Change` field to `links-section` and add a Change Log entry; verify the file shows the change linked.
