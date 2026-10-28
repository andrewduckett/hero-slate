## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: fresh context, other family (gemini/gemini-3.8-flash, via the `t3` resolver)
- **Independent**: yes
- **Tool restrictions**: read-only: view, grep, glob only. `git status --porcelain` was clean after the run.
- **Artifacts reviewed**: brainstorm.md, proposal.md, design.md, specs/, adr.md, relevant source files, at commit `73e0292`
- **Prompt**: `.workspace/home-picker-review-prompt.md`; raw findings in `.workspace/home-picker-review-raw.md`

## Findings

### 🔴 Critical (blocking)

1. **The home header had no automated coverage, on a false premise.** Check: test seams. design.md kept `AppHeader` out of `CharacterPicker` to avoid a `matchMedia` stub, but `src/test-setup.ts` stubs `matchMedia` globally and `CharacterSheet.test.ts` already renders the header through `CharacterView`. CONFIRMED.
2. **One transient failure on one character file emptied the whole roster.** Check: contradictions, assumption rows. design.md decision 4 and the character-data delta returned `error` when any entry resolved to `error`, which contradicts D4 ("the picker shows only characters that load") and the design's own rationale. CONFIRMED.

### 🟡 Moderate

3. **design.md named a test double in the smoke test that does not exist, and `serveShipped` would 404 the manifest.** Check: test seams. The smoke test uses the real provider; a listing test there needs `serveShipped` to serve `manifest.yaml`. CONFIRMED.
4. **"The browser navigates to `/sunny`" is not assertable in the component harness.** Check: scenario testability. jsdom does not navigate on a click; the next scenario already asserts the `href`. CONFIRMED.

### 📌 Suggestions

5. **Five sentences over 30 words** in design.md (lines 5, 37, 39, 49) and the character-data delta (line 100). Check: plain language. CONFIRMED.

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE_WITH_CHANGES)

1. `CharacterPicker` renders `AppHeader` and the list in one grid, as `CharacterView` does; the route wires only the provider; the component test asserts the header text. Update design.md decision 6, the context, the test seams and the risk row.
2. An entry that resolves to `error` is skipped like `not-found` and `invalid`; only a manifest load failure returns `error`. Remove the "A transient failure on one entry fails the listing" requirement, extend "Listing skips entries that do not load" with an `error` scenario, and rewrite design.md decision 4.
3. The smoke test's `serveShipped` serves `manifest.yaml`, and one new test runs the real provider's `listCharacters()` against the shipped files. Rewrite design.md decisions 9 and 10 to drop the non-existent double.
4. Replace the "Tapping a card opens the sheet" scenario with the `href` assertion, merged into "The card links to the sheet and is named after the character".
5. Split the five long sentences.

CHANGES_APPLIED: yes

## Rebuttals

- Finding 1: fixed. design.md decision 6, the Context bullets, Test Seams and the `matchMedia` risk row now say the picker renders the header and the test asserts it.
- Finding 2: fixed. `specs/character-data/spec.md` "Listing skips entries that do not load" now covers `error` with a 503 scenario; the failing-listing requirement is removed; design.md decision 4 and a new risk row record the trade-off, citing D4.
- Finding 3: fixed. design.md decisions 9 and 10 describe the real-provider smoke test and name only the `CharacterSheet.test.ts` double.
- Finding 4: fixed. `specs/home-picker/spec.md` keeps one scenario asserting the link's accessible name and destination.
- Finding 5: fixed. All five sentences are split; the character-data "Manifest load outcomes" requirement is now four short sentences.

All edits were applied in commit "docs: apply the plan review's required changes to the home picker (#31)". No artifact changed beyond the listed required changes, so this verdict stands.
