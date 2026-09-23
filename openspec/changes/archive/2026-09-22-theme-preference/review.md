## Review Metadata

- **Review round**: 2
- **Prior round**: round 1 — REVISE (2 Critical: dark-media-path contradiction; dark-default not assertable/product ambiguity)
- **Reviewer context**: cross-model (codex / OpenAI)
- **Tool restrictions**: read-only: view, grep, glob only
- **Artifacts reviewed**: proposal.md, design.md, specs/, adr (0008), relevant source files

## Findings

### 🔴 Critical (blocking)

- **The promised “dark when the device states no preference” behavior remains neither deliverable nor mechanically testable in current browsers.** `proposal.md` says, “the sheet opens dark when the device states no light or dark preference,” and the delta spec says, “So the sheet opens dark when the device states no preference.” But `design.md` correctly admits that current browsers generally resolve no preference to `light`, which matches the planned `@media (prefers-color-scheme: light)` rule and renders light. The stylesheet-base test proves only an unreachable fallback arrangement, not the stated user behavior. The plan must either define the observable CSS fallback honestly (“dark when the light media query does not match”) or choose a product behavior browsers can distinguish.  
  Citations: `openspec/changes/theme-preference/proposal.md`: “Dark becomes the resting default”; `openspec/changes/theme-preference/specs/theming/spec.md`: “So the sheet opens dark when the device states no preference”; `openspec/changes/theme-preference/design.md`: “A device that never set a preference usually reports `light` … and renders light — not the dark base.”

### 🟡 Moderate

- **The implementation plan omits existing tests that the proposed CSS inversion will break.** `generate.test.ts` requires `@media (prefers-color-scheme: dark)`, and `tightest-ratios.test.ts` derives its dark scope from that same marker. The proposal names only `emitted-css.test.ts`, while the design changes the generator to emit `@media (prefers-color-scheme: light)`. The change cannot pass the suite unless these tests are redesigned alongside the stated helper.  
  Citations: `src/lib/theme/generate.test.ts`: “emits a dark-mode media block”; `src/lib/theme/tightest-ratios.test.ts`: uses the dark media scope; `openspec/changes/theme-preference/proposal.md`: “`src/lib/theme/emitted-css.test.ts` — cover both selector paths.”

- **The proposal contradicts Story 9’s documented storage scope without scheduling an amendment.** Story 9 says the choice persists “through the existing state store”; the proposal and ADR instead create a separate global `localStorage` key outside that store. The new decision may be sound because the existing interface requires a character id, but the release plan must be updated so the change has one authoritative scope.  
  Citations: `openspec/discovery.md`: “the chosen mode persisted per device through the existing state store”; `openspec/changes/theme-preference/proposal.md`: “Not touched: the `character-state` store”; `docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md`: “We keep the chosen mode out of the character-state store.”

- **The no-flash and inline-script contract lacks a mechanically defined test.** The planned source-text check that `app.html` “contains `THEME_STORAGE_KEY`” cannot prove the inline script reads the same literal key, applies only the `light`/`dark` allowlist, catches storage failures, or sets `data-theme` before body content becomes available. Define an executable test that runs the extracted head script against mocked storage and verifies valid, malformed, and throwing-storage cases before hydration; also assert its placement in `<head>`.  
  Citations: `openspec/changes/theme-preference/design.md`: “A test reads `app.html` and asserts it contains `THEME_STORAGE_KEY`”; `openspec/changes/theme-preference/specs/theming/spec.md`: “The system SHALL apply the resolved mode before the first paint.”

### 📌 Suggestions

- **Clarify the specificity explanation without changing its correct result.** `:root` is a pseudo-class, not a class; it contributes to the class/attribute/pseudo-class specificity column. Replace “each count as a class” with that precise wording.  
  Citation: `openspec/changes/theme-preference/design.md`: “since `:root`, `[data-theme]`, and `[data-palette]` each count as a class.”

- **Tighten plain language in long, multi-idea sentences.** Split the 50-word browser-reality sentence in the ADR, the multi-clause storage-failure requirement, and the long implementation inventory in the proposal. This makes the actor, condition, and result easier to find.  
  Citations: `docs/decisions/0008-theme-mode-an-explicit-choice-over-the-device-preference.md`: “Two forces now pull against that. First, dark is the mode…”; `openspec/changes/theme-preference/specs/theming/spec.md`: “The system SHALL render the sheet even when device storage…”; `openspec/changes/theme-preference/proposal.md`: “**Code:** `src/lib/theme/generate.ts` and the generated `palette.css`…”

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

VERDICT: REVISE

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: n/a

## Rebuttals

- Round-1 dark-media-path contradiction: resolved. The design now uses a dark base and a light media override; it no longer requires an impossible dark media path.
- Round-1 dark-default ambiguity: not resolved; it remains the Critical finding above.
- Round-1 specificity calculation: resolved. The stated `(0,3,0)` result is correct.
- Round-1 extraction model, storage failures, malformed values, storage-clearing timing, Story-8 scope, and toggle accessibility: substantially resolved.

## Human Adjudication (after two consecutive REVISE verdicts)

The review process escalates to the human after two consecutive REVISE verdicts rather than looping author and reviewer again. The human reviewed the round-2 findings, judged them small and fully specified rather than fundamental defects, directed that all be applied, and authorized proceeding to `tasks.md` without a third automated review round. Both prior verdicts (REVISE) stand as the record of what the cross-model reviewer found; this note records the human's decision to proceed, and the changes applied in response. The verdict line above is therefore VOID for the current artifact contents (the artifacts changed after it was issued); it is retained as history, not as a live gate.

Fixes applied in response to round 2:

1. **Dark-fallback wording (the remaining Critical).** The product rule was resolved by the human: follow a stated device preference, use dark only when none is stated. `proposal.md` and the `Dark is the resting default` requirement now describe the honest, observable mechanism — dark applies when no stored choice is set and the `prefers-color-scheme: light` query does not match — and state plainly that current browsers usually report `light`, so the dark fallback is reached mainly in the prerendered shell. A new scenario asserts the fallback rule.
2. **Other broken tests (Moderate).** `proposal.md` and `design.md` now name all three emitted-CSS tests that assume the old layout — `emitted-css.test.ts`, `generate.test.ts`, and `tightest-ratios.test.ts` — and require each to move to the four-context model.
3. **Discovery coherence (Moderate).** `discovery.md` story 9 now records the global-key storage decision (not the character-state store), matching ADR 0008.
4. **Inline-script test (Moderate).** `design.md` now defines an executable test that runs the extracted head script against mocked storage for valid, malformed, and throwing cases, asserts `<head>` placement, and asserts the key literal equals the module's `THEME_STORAGE_KEY`.
5. **Specificity precision and plain language (Suggestions).** Corrected the `:root` pseudo-class wording and split the flagged long sentences in the ADR, spec, and proposal.
