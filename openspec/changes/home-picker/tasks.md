<!-- Five to twelve tasks. One task is one behavior, its test, and the code that passes it.
     Each task is one line: - [ ] X.Y [tags] <behavior> (verify: <command>)
     Tags: [easy|medium|complex], [parallel]. A section heading may carry [depends-on: <section>].
     A small change has one section. -->

## 1. Provider contract

- [x] 1.1 [easy] `getCharacter("manifest")` returns `not-found` without fetching, because the manifest's id is reserved (verify: `npm test -- src/lib/data/yaml.test.ts`) (✓ `npm test -- src/lib/data/yaml.test.ts` passed)
- [x] 1.2 [medium] `CharacterProvider.listCharacters()` and `CharacterSummary` exist; the YAML provider fetches `/characters/manifest.yaml`, reads its `characters` list, loads each id through `getCharacter` in parallel, and returns `found` with identity-only summaries in manifest order. The `provider()` double in `CharacterSheet.test.ts` gains a stub (verify: `npm test -- src/lib/data/yaml.test.ts src/lib/CharacterSheet.test.ts`) (✓ `npm test -- src/lib/data/yaml.test.ts src/lib/CharacterSheet.test.ts` passed)
- [ ] 1.3 [medium] The listing skips an entry that is not a string, fails the id grammar, is `manifest`, repeats an earlier id, or resolves to `not-found`, `invalid` or `error`, with no fetch for the first three; every entry skipped is `found` with an empty list (verify: `npm test -- src/lib/data/yaml.test.ts`)
- [ ] 1.4 [easy] A manifest that 404s, is the `text/html` shell, rejects, returns 5xx, fails to parse, or is not a mapping with a `characters` list returns `error`; `characters: []` returns `found` with an empty list (verify: `npm test -- src/lib/data/yaml.test.ts`)

## 2. Shipped roster [depends-on: 1]

- [ ] 2.1 [parallel] [easy] `static/characters/manifest.yaml` lists `sunny`, `gimdak` and `urven`; the smoke test skips it when collecting ids, serves it from `serveShipped`, and asserts the real provider's `listCharacters()` returns exactly the shipped ids in manifest order (verify: `npm test -- src/lib/data/characters.smoke.test.ts`)

## 3. Picker component [depends-on: 1]

- [ ] 3.1 [parallel] [medium] `CharacterPicker` takes a provider, shows the header "Hero Slate" / "Choose your hero" in the neutral palette and "Loading…" while pending, then one card per summary in order, each showing the name and the `formatIdentity` descriptor as text (verify: `npm test -- src/lib/CharacterPicker.test.ts`)
- [ ] 3.2 [easy] Each card is a link to `/<id>` whose accessible name includes the character's name, and its `<li>` carries `data-palette` from `resolvePalette`, so an unknown or missing color yields `neutral`; the card is styled as a mini header (accent fill, on-accent text, 44px minimum, `minmax(16rem, 1fr)` grid) (verify: `npm test -- src/lib/CharacterPicker.test.ts`)
- [ ] 3.3 [easy] An `error` result shows "Could not load characters. Try again." and no cards; a `found` result with no summaries shows "No characters yet." and no cards; "Loading…" disappears once the listing resolves (verify: `npm test -- src/lib/CharacterPicker.test.ts`)

## 4. Integration [depends-on: 2, 3]

- [ ] 4.1 [easy] `src/routes/+page.svelte` renders `CharacterPicker` with the YAML provider in place of the placeholder header, and the built site ships `/characters/manifest.yaml` beside the character files (verify: `npm run build && test -f build/characters/manifest.yaml`)
- [ ] 4.2 [medium] The whole suite and the build pass, and a reviewer confirms in a browser that `/` at 360 CSS pixels does not scroll sideways, each card is at least 44 by 44 CSS pixels, and at 1280 pixels the content is no wider than 44rem (verify: `npm test && npm run build`)

## Deviations Ledger

<!-- Dated notes on small departures from the plan, written during apply. Stop and ask the user about a large one. -->
