# Adversarial Review — palette-depth

## Review Metadata

- **Review round**: 2
- **Prior round**: round 1 returned `VERDICT: REVISE` — four critical findings, all fixed
  in commit `9c835da`.
- **Date**: 2026-09-20
- **Author family**: `claude` (Claude Opus 5)
- **Reviewer family**: `gemini` (`gemini-3.1-pro-high`, via `agy --mode plan`, read-only)
- **Independence**: cross-model, fresh context. The reviewer read only files on disk. It
  re-derived every contrast ratio with its own script rather than trusting the design.
- **Escalation**: two consecutive REVISE verdicts. Per the schema's rounds rule, the
  author stops here and escalates rather than running round 3 unprompted.

The author verified every finding against the repository. Each carries CONFIRMED,
REFUTED, or NOTED.

## Findings

### 🔴 R2-F1. The tint separation floor does not cover the page surface

- **Verdict**: CONFIRMED as a contradiction between the spec and the design.
- **Artifact**: `specs/theming/spec.md`, `Soft tint background`
- **The defect**: The requirement describes a tint as "a soft background wash drawn on
  the surface or the raised surface", then imposes the 1.2:1 separation floor against
  the raised surface only. A tint drawn on the page has no separation rule at all.
- **The scenario**: Measured, light mode: `fire` tint on the surface is **1.104:1**,
  `sun` **1.111:1**, `ocean` **1.117:1**, `berry` **1.146:1**. Four of six fall below the
  floor the requirement sets for the other background. A wash placed on the page would
  be close to invisible.
- **The author's reading**: The numbers are right, but the fix is not a second floor.
  The light-mode surface and raised surface are only **1.096:1** apart to begin with. A
  tint clearing 1.2:1 against *both* would have to sit below the page background, which
  then squeezes `deep` on `tint` from the other side. Design D5 places every tint inside
  a raised card — the section strip, the pool dot, the tracker's bar track, the dice
  pill. None is drawn on the page. So the requirement's wording is broader than any use.
- **What must be true**: Narrow the requirement to say a tint is drawn on the raised
  surface, and keep the single floor. If a later change wants a tint on the page, that
  change adds the rule and re-tunes.

### 🔴 R2-F2. No record covers decoupling colour from the character

- **Verdict**: CONFIRMED. Two rounds have now converged on this area, and the author
  accepts the escalation.
- **Artifact**: `adr.md`; `docs/decisions/0006-...md`
- **The defect**: ADR 0006 records the token split and nothing else. The change also
  reverses how colour is assigned: colour now marks what a block *is* rather than whose
  sheet it is. No record covers that.
- **The scenario**: A maintainer asks why a forest druid's tracker is red, finds the
  mapping table, sees it is trivially editable, and reverts it. They restore the
  single-hue page the change existed to fix, because nothing told them why.
- **The author's earlier position, now withdrawn**: Round 1 raised the neighbouring
  question of author overrides. The author answered it by softening the spec, and judged
  the mapping itself "one table in code". That conflated two things. The *mapping* is
  cheap to change. The *principle* — colour encodes meaning, not identity — is the
  paradigm the sheet is built on, and reversing it silently is exactly the failure a
  record prevents.
- **What must be true**: A second record covers the role decision, its alternatives, and
  what it costs. The manifest's exclusion entry is withdrawn.

### 🟠 R2-F3. Roles borrow character palettes, so tuning one moves the other

- **Verdict**: CONFIRMED. Not raised in round 1, and the author had not considered it.
- **Artifact**: `design.md` D4
- **The defect**: Each role resolves to an existing palette name. The design presents
  this as free — roles inherit every contrast rule and add no values. It does not note
  the coupling that comes with it.
- **The scenario**: Someone warms `fire` toward orange so the `fire` character theme
  reads better. Every character's hit points tracker turns orange, on every sheet,
  because health borrows that name. The two needs have no reason to stay aligned.
- **What must be true**: The design states the coupling as an accepted trade-off and
  names the escape hatch — roles can take their own token set later without touching the
  palette contract.

### 🟠 R2-F4. Plain-language violations introduced by the round 1 fixes

- **Verdict**: CONFIRMED. All three verified.
- **Artifacts and text**:
  - `docs/decisions/0006-...md` — "Should the palette ever grow past a handful of names,
    generating a first draft from a formula and hand-correcting it is the obvious next
    step, and nothing in this decision blocks that." Counted at **32 words**.
  - `design.md` — "Every pair above was computed against every rule in the delta spec, in
    both modes, before this design was accepted." Passive twice; names no actor.
  - `specs/theming/spec.md` — "Both SHALL be retargeted to `deep`." Names no actor.
- **Note**: The author introduced all three while fixing round 1. That is the cost of
  editing prose under time pressure, and it is why the standard is checked every round.

### 📌 R2-F5. The tinted shadow is unproposed and allegedly breaks the opacity rule

- **Verdict**: REFUTED in part, NOTED in part.
- **Refuted**: The existing `Color values are opaque sRGB` requirement governs *theme
  colour values* — the palette and base tokens that the contrast tests read. A shadow is
  not one. The `sheet-restyle` design that shipped the current shadow states the rule
  plainly: only decorative lines and shadows, which carry no text, may blend. The
  current `base.css` already ships `rgb(0 0 0 / 0.08)`. So the change breaks nothing.
- **Noted**: The reviewer is right that `proposal.md` never mentions the shadow while
  `design.md` D5 changes it. The design should say the shadow is decorative and sits
  outside the token contract, or drop the tweak.

## Checked and Held Up

The reviewer wrote its own WCAG implementation and re-derived every pair independently.
It confirmed:

- **Every value passes.** All six names, both modes, all readability rules and the
  separation floor against the raised surface.
- **The round 1 fixes hold.** Ocean accent `#2d79a6` on white at 4.78:1. Light `fire`
  deep on tint at 5.33:1. Light `fire` tint against raised at 1.21:1. The six new
  dark-mode rows, including the tightest pair, dark `forest` muted on tint at 4.71:1.
- **The 1.2:1 floor is mechanically assertable** from the emitted stylesheet, unlike the
  "differs" check it replaced.
- **The accent-as-text usage risk** is correctly stated and correctly accepted as caught
  by review rather than by CI.

## Required Changes

Not applicable. The verdict is REVISE.

## Rebuttals

R2-F5 is rebutted in part above. It is a Suggestion, so the author may decline the
refuted half without reviewer sign-off; the noted half will be fixed regardless.

The round 1 rebuttal of F11 (structural colour and warmed surface as scope creep) was
not re-raised in round 2. The author treats it as dropped.

CHANGES_APPLIED: n/a

VERDICT: REVISE
