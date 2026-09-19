## 1. Rich-text parser

- [ ] 1.1 Define the `Node` token type in `src/lib/richtext/parse.ts` (`text`, `strong`,
  `em`, `pill`) and verify TypeScript compiles with `npm run check`.

- [ ] 1.2 Write failing tests in `src/lib/richtext/parse.test.ts` for plain text, bold,
  italic, and bold-wraps-italic; verify tests fail before implementation.

- [ ] 1.3 Implement `parse(body: string): Node[]` with bold and italic support and verify
  the round 1.2 tests pass.

- [ ] 1.4 Write failing tests for forgiving-parse edge cases: unmatched `*`, unclosed
  `**`, overlapping markers (same-kind close, inner-span abandonment), and nesting
  beyond 8 levels; verify tests fail before implementation.

- [ ] 1.5 Extend the parser to handle the forgiving-parse rules and verify all 1.4 tests
  pass.

- [ ] 1.6 Write failing tests for pill classification: bonus pill (`[[+7]]`, `[[-2]]`),
  dice pill (`[[d20+6]]`, `[[2d6]]`, `[[1D20]]`, `[[advantage]]`), empty/whitespace
  pill (literal original chars), and `[[]]` (literal); verify tests fail.

- [ ] 1.7 Implement `[[...]]` pill tokenisation and verify all 1.6 tests pass.

- [ ] 1.8 Write adversarial XSS fixtures: `<script>alert(1)</script>` as plain text,
  `[[</span><img onerror=x>]]` as a pill label, and `**<b>hi</b>**` as a bold span;
  verify each fails before implementation then passes after.

## 2. Rich-text renderer

- [ ] 2.1 Create `src/lib/richtext/RichText.svelte` as a recursive renderer that walks a
  `Node[]` tree using Svelte text bindings (no `{@html}`); verify the component
  mounts in the jsdom test environment without error.

- [ ] 2.2 Write rendering tests: bold renders `<strong>`, italic renders `<em>`, dice
  pill contains the 🎲 glyph, bonus pill has no glyph, text nodes escape HTML
  characters; verify tests pass.

- [ ] 2.3 Write a rendering test that passes the three XSS fixtures from 1.8 through
  `parse` then `RichText` and asserts the output contains no `<script>` or `<img>`
  elements; verify the test passes.

## 3. Sections resolver

- [ ] 3.1 Write failing tests in `src/lib/character/sections.test.ts` for valid section
  order, empty-sections field, section with zero valid rows omitted, invalid
  definitions silently ignored, absent and unknown `color` both resolve to neutral,
  and own-key-safe reads (`__proto__` in a value position does not throw); verify
  tests fail.

- [ ] 3.2 Implement `resolveSections(sections: unknown): ResolvedSection[]` in
  `src/lib/character/sections.ts` and verify all 3.1 tests pass.

- [ ] 3.3 Write failing tests for row resolution: authored order preserved, row with no
  `body` dropped, row with no `title` included as body-only, unknown row `color`
  falls back to neutral, row with no `color` inherits section palette; verify tests
  fail.

- [ ] 3.4 Extend `resolveSections` to resolve rows and verify all 3.3 tests pass.

## 4. Sections block

- [ ] 4.1 Write failing tests in `src/lib/character/SectionsBlock.test.ts`: no sections
  renders nothing, a valid section renders its heading and rows, section heading uses
  `data-palette`, row title uses accent color, body-only row renders without a title
  column; verify tests fail.

- [ ] 4.2 Create `src/lib/character/SectionsBlock.svelte` that calls `resolveSections`,
  renders each section with a `data-palette` heading, and renders each row using
  `<RichText>` for the body; verify all 4.1 tests pass.

## 5. Theming guarantee

- [ ] 5.1 Add a test group to `src/lib/theme/emitted-css.test.ts` that reads `palette.css`
  and asserts `--accent` on `--surface` meets WCAG AA (4.5:1) for every named
  palette in both light and dark modes; verify the new tests pass without any
  palette change.

## 6. Wire up and character data

- [ ] 6.1 Import `SectionsBlock` in `src/lib/CharacterView.svelte` and render it below
  `<CombatBlock>`, passing `result.character.sections`; verify the existing
  `CharacterView` tests still pass with `npm test`.

- [ ] 6.2 Restructure `sections` in `static/characters/sunny.yaml` to the new shape
  (`title`, `color`, `rows: [{title, body}]`) with a realistic "Your Turn" section
  using at least one `[[d20+6]]` pill and one `[[+7]]` bonus pill; verify
  `npm run build` completes without error.

- [ ] 6.3 Run the full test suite (`npm test`) and confirm all tests pass with no
  regressions.
