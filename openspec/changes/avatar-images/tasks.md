<!-- One task is one behavior, its test, and the code that passes it.
     Each task is one line: - [ ] X.Y [tags] <behavior> (verify: <command>)
     Tags: [easy|medium|complex], [parallel]. A section heading may carry [depends-on: <section>]. -->

## 1. Identity contract

- [x] 1.1 [easy] The provider returns `invalid` with reason `avatar must be a string` for a non-string `avatar`, carries a string `avatar` through unchanged (a remote URL included), and reports an absent `avatar` as absent; `Character` gains `avatar?: string` (verify: `npx vitest run src/lib/data/yaml.test.ts`) (✓ `npx vitest run src/lib/data/yaml.test.ts` passed, 43/43)
- [x] 1.2 [easy] `listCharacters` copies `avatar` into each summary when the definition has one and omits it otherwise; `CharacterSummary` gains `avatar` (verify: `npx vitest run src/lib/data/yaml.test.ts`) (✓ `npx vitest run src/lib/data/yaml.test.ts` passed, 45/45)
- [x] 1.3 [medium] `resolveAvatar(value)` in `src/lib/avatar.ts` returns `/characters/sunny.png` for that value and `undefined` for `https://…`, `//example.test/…`, `/\example.test/…`, a value with an embedded newline, `javascript:…`, a relative path, the empty string, a non-string and `undefined`, without throwing (verify: `npx vitest run src/lib/avatar.test.ts`) (✓ `npx vitest run src/lib/avatar.test.ts` passed, 12/12)

## 2. Rendering [depends-on: 1]

- [x] 2.1 [medium] `AvatarArt` renders `<img src alt="">` for a resolving `avatar`, renders no element for any other value, removes the element after the image's `error` event, and its bindable `showing` is true exactly while the element is in the DOM (verify: `npx vitest run src/lib/AvatarArt.test.ts`) (✓ `npx vitest run src/lib/AvatarArt.test.ts` passed, 8/8)
- [x] 2.2 [parallel] [medium] `AppHeader` with an `avatar` prop shows the image, sets `data-avatar` while it shows and clears it after a load error, keeps the title, subtitle and toggle, and wraps the toggle in an opaque accent backing; `CharacterView` passes the character's `avatar` to the header and the home header passes none (verify: `npx vitest run src/lib/AppHeader.test.ts src/lib/CharacterView.test.ts src/lib/CharacterPicker.test.ts`) (✓ `npx vitest run src/lib/AppHeader.test.ts src/lib/CharacterView.test.ts src/lib/CharacterPicker.test.ts` passed, 59/59)
- [x] 2.3 [parallel] [medium] A picker card shows the image for a summary with a resolving `avatar`, shows none for a summary without one or with a remote URL, drops it after a load error, and its link's accessible name still includes the character's name and nothing from the image (verify: `npx vitest run src/lib/CharacterPicker.test.ts`) (✓ `npx vitest run src/lib/CharacterPicker.test.ts` passed, 20/20)
- [x] 2.4 [medium] The header and the card reserve the image's width for their text only while `data-avatar` is set, clip the image to their rounded corners, and fade it with a CSS mask (`-webkit-` prefixed too); the full suite stays green (verify: `npm test`) (✓ `npm test` passed, 801/801; layout is checked in the browser in 3.2)

## 3. Sample art and acceptance [depends-on: 2]

- [x] 3.1 [medium] `static/characters/sunny.png` is an original 512×512 placeholder portrait (the `design-assets:ai-image-generator` skill if a key is configured, otherwise a hand-authored SVG rasterised with `uv run --with cairosvg`), `sunny.yaml` gains `avatar: /characters/sunny.png`, and every shipped character still loads and lists (verify: `npx vitest run src/lib/data/characters.smoke.test.ts`) (✓ `npx vitest run src/lib/data/characters.smoke.test.ts` passed, 8/8)
- [x] 3.2 [medium] The whole suite and the build pass, and a reviewer runs every reviewer scenario in `specs/character-sheet/spec.md` and `specs/home-picker/spec.md` in a browser — `/sunny` and `/` in light and dark mode at 1024×768 and 360 wide, plus `/urven` (no avatar) to confirm the plain layout — and records the results in the pull request description (verify: `npm test && npm run build`) (✓ `npm test` passed 804/804 and `npm run build` succeeded; browser results recorded in PR #98)

## 4. Change request: avatar named after the character [depends-on: 3]

<!-- PR #98: the image is /characters/<id>.png, located by the provider; no authored field (brainstorm D14–D17). -->

- [x] 4.1 [easy] The provider sets `avatar` to `/characters/<id>.png` on every `found` character, overwriting any authored `avatar` (a remote URL or a number included) without returning `invalid`, and `listCharacters` carries it into each summary; the `avatar must be a string` check is gone (verify: `npx vitest run src/lib/data/yaml.test.ts`) (✓ `npx vitest run src/lib/data/yaml.test.ts` passed, 44/44)
- [x] 4.2 [medium] `AvatarArt` takes `src?: string` and renders `<img src alt="">` for any string, no element for `undefined`, and drops the element after `error`; `AppHeader`, `CharacterView` and the picker pass the provider's `avatar` straight through; `src/lib/avatar.ts` and its test are deleted (verify: `npx vitest run src/lib/AvatarArt.test.ts src/lib/AppHeader.test.ts src/lib/CharacterView.test.ts src/lib/CharacterPicker.test.ts`) (✓ that command passed, 70/70; `npm run check` shows only the known `@types/node` errors)
- [ ] 4.3 [easy] `sunny.yaml` loses its `avatar` line, and the smoke test checks that every `.png` in `static/characters/` is named after a shipped character (verify: `npx vitest run src/lib/data/characters.smoke.test.ts`)
- [ ] 4.4 [medium] The whole suite and the build pass, and a reviewer re-runs the reviewer scenarios in a browser — `/sunny` and `/` in light and dark mode at 1024×768 and 360 wide, plus `/urven` (no image file) to confirm the image is dropped and the plain layout shows — and updates the results in the pull request description (verify: `npm test && npm run build`)

## Deviations Ledger

<!-- Dated notes on small departures from the plan, written during apply. Stop and ask the user about a large one. -->

- 2026-10-28: New tests use neutral ids and paths (`test-hero`, `/characters/test-hero.png`) rather than `sunny`, following the unmerged `decouple-character-tests` change (#90), which keeps shipped character names out of tests. The behaviour each task names is unchanged.
- 2026-10-28: No image-generation API key is configured on this machine, so `sunny.png` is the fallback the plan names: a hand-authored SVG rasterised with `uv run --with cairosvg`. The SVG stays in `.workspace/`.
- 2026-10-28: Task 3.1 adds a smoke test that each shipped character's `avatar`, when set, resolves and names a file under `static/`, so a typo in an avatar line fails the suite instead of silently showing nothing.
