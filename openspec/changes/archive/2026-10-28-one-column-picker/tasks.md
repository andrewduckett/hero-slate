<!-- One task is one behavior, its test, and the code that passes it.
     Each task is one line: - [ ] X.Y [tag] <behavior> (verify: <command>)
     Tags: [easy|medium|complex]. This flow builds tasks in order, so there are no parallel tags.
     This XS story has two tasks: the layout has no unit test (brainstorm D4), so the browser review is its acceptance. -->

## 1. One-column picker

- [x] 1.1 [easy] The picker's card list is a single column at every width, each card spanning the home page content: the `ul` drops the `auto-fill`/`minmax(16rem)` tracks and the comment that explained them, and the existing picker tests stay green (verify: `npx vitest run src/lib/CharacterPicker.test.ts`) (✓ `npx vitest run src/lib/CharacterPicker.test.ts` passed, 19 tests)
- [x] 1.2 [easy] The whole suite and the build pass, and a reviewer runs the scenarios in `specs/home-picker/spec.md` and the existing "Cards fit a phone screen" scenario in a browser — `/` with the shipped characters at 1024×768 and at 360 wide — confirming one card per row, full-width cards, no sideways scroll and 44×44 tap targets, and records the results in the pull request description (verify: `npm test && npm run build`) (✓ `npm test` passed, 786 tests; `npm run build` passed; browser review at 1024×768 and 360×740 recorded in PR #100)

## Deviations Ledger

<!-- Dated notes on small departures from the plan, written during apply. Stop and ask the user about a large one. -->
