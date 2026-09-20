# Adversarial Review — palette-depth

## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Date**: 2026-09-20
- **Author family**: `claude` (Claude Opus 5)
- **Reviewer family**: `gemini` (`gemini-3.1-pro-high`, via `agy --mode plan`, read-only)
- **Independence**: cross-model. The reviewer read only files on disk and no authoring
  transcript. A check of `git status` after the run confirmed it wrote nothing.
- **Artifacts reviewed**: `proposal.md`, `design.md`, `specs/theming/spec.md`, `adr.md`,
  `docs/decisions/0006-palette-tokens-separate-fills-from-marks.md`

The author verified every finding against the repository before accepting it. Each
carries CONFIRMED, REFUTED, or NOTED. One finding the reviewer missed is added at the
end, found by an independent contrast check the author ran in parallel.

## Findings

### 🔴 F1. Two existing accent-as-text tests fail, and the delta removes only one

- **Verdict**: CONFIRMED, and wider than reported.
- **Artifact**: `design.md` ("No existing assertion is loosened");
  `src/lib/theme/emitted-css.test.ts`
- **The defect**: `emitted-css.test.ts` holds two accent-as-text assertions, not one.
  Line 65 asserts accent on `--surface`. Line 96 asserts accent on `--raised`. The
  delta spec removes only the raised rule. The surface assertion has no spec
  requirement behind it, so nothing in the change accounts for it.
- **The scenario**: The implementer adds the `sun` accent `#e9a23b` at migration step 3.
  `npm test` fails at line 71: gold on the surface `#f7f2e8` measures about 1.9:1.
  Nothing in the artifacts tells them whether that test is wrong or their value is.
- **What must be true**: The delta spec must also account for accent-on-surface, and
  `design.md` must drop the claim that no existing assertion is loosened.

### 🔴 F2. "Differs" does not enforce "visually distinct"

- **Verdict**: CONFIRMED. The author wrote this requirement and agrees it is too weak.
- **Artifact**: `specs/theming/spec.md`, `Soft tint background`
- **The defect**: The requirement says a tint "SHALL also be visually distinct from the
  raised surface", then specifies the test as asserting the two values differ. Strict
  inequality does not express visual distinction.
- **The scenario**: A tint of `#fffffe` against a raised surface of `#ffffff` passes the
  test. The wash is invisible, so the tinted area reads as the card it sits on and the
  token buys nothing.
- **What must be true**: The requirement must name a measurable floor — a minimum
  contrast ratio between tint and raised, or a perceptual distance — that a test can
  assert.

### 🔴 F3. `HitPointsBlock` keeps drawing text in `accent`

- **Verdict**: CONFIRMED, and wider than reported.
- **Artifact**: `design.md` D5; `src/lib/character/HitPointsBlock.svelte:139,183`
- **The defect**: Five components draw text in `var(--accent)`:
  `AbilitiesBlock:62`, `SectionsBlock:77`, `RichText:33`, and `HitPointsBlock:139`
  (the current-value readout) and `:183` (the damage button labels). D5's usage table
  covers the first three. It lists the tracker's fills and its bar ring, and never
  mentions the readout or the buttons.
- **The scenario**: Once the accent-as-text rule is lifted, a mid-tone accent is legal.
  The health role currently maps to `fire`, which stays dark, so nothing breaks today.
  Remap health to `sun` later and the readout renders gold on a white card at about
  2.2:1 — the exact failure this change exists to prevent, reintroduced silently.
- **What must be true**: D5 must route both the readout and the damage-button labels to
  `deep`, and the task list must name every one of the five call sites.

### 🔴 F4. The proposed `ocean` accent fails its own on-accent rule

- **Verdict**: CONFIRMED. **Found by the author, missed by the reviewer.**
- **Artifact**: `design.md` D3, light-mode table
- **The defect**: `ocean` proposes accent `#2f7fae` with `onAccent` `#ffffff`. That pair
  measures **4.40:1**, below the 4.5:1 the unchanged `Accent and on-accent meet a
  contrast minimum` requirement demands. The design borrowed the value from the
  reference page, which never carried white text on it.
- **The scenario**: The implementer fills in `ocean` at migration step 3 and the
  existing on-accent test fails. It is the one proposed value that breaks a rule the
  change does not touch.
- **What must be true**: Darken the accent — `#2d79a6` gives 4.78:1 and keeps the hue —
  or pair it with a dark `onAccent`.

### 🟠 F5. Build-time token derivation was never considered

- **Verdict**: CONFIRMED as a gap in the record, though the decision likely survives.
- **Artifact**: `docs/decisions/0006-...md`, "Keep two tokens and blend"
- **The defect**: The ADR rejects blending because a run-time CSS mix cannot be read back
  from the stylesheet. That reasoning is sound for run-time mixing, and it never
  addresses the obvious variant: derive `tint` and `deep` from `accent` inside
  `generate.ts` and emit static hex. The tests would read those values fine.
- **The scenario**: A later reader sees 60-odd hand-tuned values, asks why they are not
  generated, and finds the record answers a question they did not ask.
- **What must be true**: The ADR must address build-time derivation on its merits. The
  author's position is that derivation loses hue control — the reference's `sage`
  `#cfe3bf` is not a mechanical lightening of `forest` `#2f5d3a` — but the record has to
  say so rather than leave the alternative unnamed.

### 🟠 F6. The dark-mode table is truncated

- **Verdict**: CONFIRMED.
- **Artifact**: `design.md` D3
- **The defect**: The dark-mode table lists `forest` and then a literal `...`. Five of
  six palettes have no proposed dark values, and the text defers them to "let the tests
  decide".
- **The scenario**: The implementer hits the tightest rule in the change — `deep` on
  `tint` — with no starting point, in the mode the reference design cannot supply
  values for. The design proves the math holds in light mode only.
- **What must be true**: Either the design supplies dark-mode starting values, or it
  states plainly that dark values are an implementation task and says why that is safe.

### 🟠 F7. Roles being non-overridable is a durable decision, not just a table

- **Verdict**: CONFIRMED. The author's ADR manifest under-read this one.
- **Artifact**: `adr.md`, "Decisions That Did Not Meet the Bar"
- **The defect**: The manifest dismisses the role work as "one table in code". The
  mapping is. But `specs/theming/spec.md` also requires that "A config author SHALL NOT
  be able to set or override a role." That is a config-contract boundary, and the
  manifest never weighs it.
- **The scenario**: An author wants a deliberately monochrome character. The sheet forces
  a red tracker and a gold initiative tile regardless. Granting the override later is
  easy; withdrawing it once authors rely on it is breaking. The direction of that
  asymmetry is exactly what a decision record exists to capture.
- **What must be true**: Either record the config-contract decision, or soften the spec
  so it does not foreclose author control forever.

### 📌 F8. A 32-word sentence in the delta spec

- **Verdict**: CONFIRMED. Counted at 32 words against the 30-word ceiling.
- **Artifact**: `specs/theming/spec.md`, `Structural base color`
- **Fix**: Split after "against the raised surface."

### 📌 F9. Passive voice hides the actor in ADR 0006

- **Verdict**: CONFIRMED.
- **Artifact**: `docs/decisions/0006-...md` — "a blended colour cannot be read back from
  the stylesheet"
- **Fix**: Name the actor: "the contrast tests cannot read a blended colour back".

### 📌 F10. Two terms for one concept in the proposal

- **Verdict**: NOTED, weak. "Middle value" and "soft fill" sit in adjacent sentences and
  both point at `tint`. The author reads these as a plain-language gloss before the token
  is named, not as elegant variation, but a single term costs nothing.
- **Artifact**: `proposal.md`, Why, third cost

### 🟠 F11. Structural colour and the warmed surface are scope creep

- **Verdict**: REFUTED as stated; NOTED as a judgment call.
- **Reason**: Both items appear in `proposal.md` under What Changes, so they are declared
  scope, not creep against the proposal. The reviewer's underlying point — that base
  colours could ship separately — stands as a preference. The author's position is that
  the warmed raised surface is not separable: `#ffffff` cards are what the new tints are
  measured against, and changing that value later would invalidate every tint check.

## Checked and Held Up

The reviewer verified and the author re-confirmed:

- The `sun` deep value. `#9a6312` on `#fdeccf` does fail, and the design's darkened
  `#7d5010` passes on the tint.
- The warmed raised surface `#fffdf6`. Foreground and muted text both still clear 4.5:1.
- The spent pool dot. `structural` `#6b4a2b` passes on the new raised surface.

The author additionally computed every proposed light-mode pairing against every rule in
the delta spec. All pass except `ocean` on-accent (F4). Specifically: on-accent/accent,
foreground/tint, muted/tint, deep/tint, deep/surface, deep/raised for all six names, plus
structural on both surfaces.

## Required Changes

Not applicable. The verdict is REVISE, so the artifacts are fixed and the full review is
re-run in a fresh context rather than spot-checked.

## Rebuttals

F11 is rebutted above. It is a Moderate finding, so the rebuttal counts only once the
reviewer re-checks and accepts it in round 2.

CHANGES_APPLIED: n/a

VERDICT: REVISE
