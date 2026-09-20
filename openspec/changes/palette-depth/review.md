# Adversarial Review — palette-depth

## Review Metadata

- **Review round**: 3
- **Prior rounds**: round 1 `REVISE` (4 critical, all fixed in `9c835da`); round 2
  `REVISE` (2 critical, all fixed in `99ae552`).
- **Date**: 2026-09-20
- **Author family**: `claude` (Claude Opus 5)
- **Reviewer family**: `gemini` (`gemini-3.1-pro-high`, via `agy --mode plan`, read-only)
- **Independence**: cross-model, fresh context. The reviewer re-derived every contrast
  ratio with its own script and read the component source rather than the design's
  description of it.

The author verified every finding against the repository. Each carries CONFIRMED,
REFUTED, or NOTED. All findings are fixed in the commit that carries this review.

## Findings

### 🔴 R3-F1. Nothing says how the system recognises a role from an authored label

- **Verdict**: CONFIRMED. New this round; rounds 1 and 2 both missed it.
- **Artifact**: `specs/theming/spec.md`, `Fixed color roles`
- **The defect**: The requirement assigns fixed roles to armor class, speed, and
  initiative. Those three are not structured fields. They arrive as authored
  `{ label, value }` combat entries, and `src/lib/character/combat.ts` carries the label
  through as a free string with no fixed vocabulary. The spec never says how a label
  becomes a role, and never says what an unmatched entry renders in.
- **The scenario**: A parent writes `AC` instead of `Armor Class`, or adds a custom
  `Carrying Capacity` row. The implementer has no rule to follow, so the entry either
  silently loses its colour or renders undefined, depending on how they guess.
- **The fix**: The requirement now defines matching — compare the authored label against
  a fixed list per role, ignoring case and surrounding whitespace, with each label name
  in at most one list — and defines the fallback: an unmatched entry renders in the
  character's resolved palette. Two scenarios cover case/whitespace and the fallback.
  `design.md` D4 names the concrete label lists.

### 🟠 R3-F2. The dice pill's border was missed, and it is a blended colour

- **Verdict**: CONFIRMED, and more pointed than reported.
- **Artifact**: `design.md` D5; `src/lib/richtext/RichText.svelte:28`
- **The defect**: The call-site list added in round 1 said line 33 covered "the dice
  pill's text and border". It does not. Line 33 is the text; line 28 is the border, and
  it is `color-mix(in srgb, var(--accent) 45%, transparent)`.
- **The scenario**: Once a mid-tone accent is legal, a 45%-opacity accent border on a
  card can disappear. The pill loses its boundary while its text stays visible.
- **The fix**: D5 now lists six call sites across five components, with line 28 separate,
  and notes that replacing the blend with a solid `deep` also removes a blended colour
  from a component that carries text — which the project's own rule wanted anyway.

### 📌 R3-F3. The tinted shadow is scope creep

- **Verdict**: CONFIRMED and acted on. Raised as a Suggestion in round 2 as well, where
  the author kept it as optional. Keeping a contested optional was the wrong call.
- **The fix**: Dropped. The shadow stays as it is, and the design says so.

### 📌 R3-F4. Long sentences and process narrative

- **Verdict**: CONFIRMED. All four verified.
- **The fix**: Split the three sentences over 30 words in `design.md` D4, `design.md` D5,
  and ADR `0007`. Removed the review narrative from `adr.md`, which should state the
  final position rather than how it was reached.

## Checked and Held Up

The reviewer verified independently:

- **Every value, recomputed.** Its own WCAG implementation reproduced the design's
  tightest pairings exactly: dark `forest` muted-on-tint 4.71:1, light `fire`
  deep-on-tint 5.33:1, light `fire` tint-on-raised 1.21:1. The round 2 edits broke none.
- **The narrowed tint rule holds in practice.** It read `SectionsBlock`,
  `ResourcePoolsBlock`, and `HitPointsBlock` and confirmed every tint sits inside a
  container using the raised background. No tint leaks onto the page surface.
- **Both ADRs meet the bar**, and excluding the specific mapping table is well justified.
- **Dark mode is fully specified**, not deferred.
- **The 1.2:1 floor is mechanically assertable.**
- **Colour is not the sole carrier of meaning.** It checked that `HitPointsBlock` and
  `CombatBlock` keep their text labels, so a role's colour is never the only signal.

## Author's Calibration Note

R3-F1 is a real gap and the verdict is recorded as issued. The author notes for the
record that its fix was small, unambiguous, and fully specifiable, which is the schema's
own description of APPROVE_WITH_CHANGES. Rounds are converging: 4 criticals, then 2,
then 1, with each round's findings genuinely new rather than restated.

## Required Changes

Not applicable. The verdict is REVISE.

## Rebuttals

None. Every finding was accepted and fixed.

CHANGES_APPLIED: n/a

VERDICT: REVISE
