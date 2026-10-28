## 1. Sheet columns

- [x] 1.1 [medium] `CharacterView` puts the Stats, Health and Pools groups inside a `data-column="left"` wrapper and the sections and Links group inside a `data-column="right"` wrapper. The document order stays header, abilities, combat, hit points, pools, sections, links (design Decision 1; spec "Sheet block order"). (verify: npx vitest run src/lib/CharacterView.test.ts) (✓ npx vitest run src/lib/CharacterView.test.ts passed, 24 tests)
- [ ] 1.2 [easy] `CharacterView` renders a column wrapper only when at least one of its blocks renders, using a new `hasSections` built on `resolveSections`. When exactly one wrapper renders, it carries `data-span="full"`. A character with only a name renders neither wrapper (design Decision 2; spec "A sheet with one side empty uses the full width"). (verify: npx vitest run src/lib/CharacterView.test.ts)
- [ ] 1.3 [easy] From `@media (min-width: 64rem)`, the sheet's `article` lays out two `minmax(0, 1fr)` columns with a `--space-6` gap and `align-items: start`. The header and a `data-span="full"` wrapper span `1 / -1`. Each wrapper is a grid with a `--space-5` gap, so one column keeps today's spacing. A comment names `base.css` as the other `64rem` site (design Decisions 1 and 6). (verify: npm run build)

## 2. Tiles and content width

- [ ] 2.1 [parallel] [medium] `AbilitiesBlock` makes its section an inline-size container and lays out the tiles in an inner `div.tiles` grid: 3 per row by default, and 6 per row from `@container (min-width: 40rem)`. Each tile keeps its `.ability` class (design Decision 3; spec "Ability tiles sit 3 or 6 per row"). (verify: npx vitest run src/lib/character/AbilitiesBlock.test.ts)
- [ ] 2.2 [parallel] [easy] `CombatBlock` lays out its tiles with `repeat(3, minmax(0, 1fr))` at every width, replacing `auto-fit` (design Decision 4; spec "Combat tiles sit 3 per row"). (verify: npx vitest run src/lib/character/CombatBlock.test.ts)
- [ ] 2.3 [parallel] [easy] On the `/[id]` route, `+layout.svelte` adds `page--sheet` to `<main>`, reading `page.route.id` from `$app/state`. From `@media (min-width: 64rem)`, `base.css` widens `.page--sheet` to `max-width: 80rem`, and a comment names `CharacterView` as the other `64rem` site. `/` keeps 44rem (design Decision 5; spec "Wide sheet content width"). (verify: npm run build)

## 3. Verification [depends-on: 1, 2]

- [ ] 3.1 [easy] The full test suite and the static build pass (verify: npm test && npm run build)
- [ ] 3.2 [medium] In a browser at the default font size, a reviewer runs every reviewer scenario in `specs/character-sheet/spec.md` and records the results in the pull request description. The checks cover `/sunny`, `/urven` and `/gimdak` at 1280×800, 1024×768, 800×1280, 600 and 360 wide; `/` at 1280×800; focus order on `/urven`; and a temporary character with no sections and no links (verify: npm run build)

## Deviations Ledger

<!-- Dated notes on small departures from the plan, written during apply. Stop and ask the user about a large one. -->
