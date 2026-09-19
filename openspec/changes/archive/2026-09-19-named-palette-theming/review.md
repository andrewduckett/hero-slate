## Review Metadata

- **Review round**: 4
- **Prior round**: round 3 verdict REVISE (color values under-specified; long sentences). Rounds 1-3 also REVISE; each round's findings were applied. Verdicts converged 5 -> 3 -> 2 -> 2 Critical.
- **Reviewer context**: cross-model (codex CLI, GPT-family), read-only
- **Tool restrictions**: read-only (view, grep, glob only)
- **Artifacts reviewed**: proposal.md, design.md, specs/theming/spec.md, specs/character-data/spec.md, adr.md, relevant source files

<!-- Human decision on this round: see Resolution below. -->

## Findings

### 🔴 Critical (blocking)

1. `design.md` and `specs/theming/spec.md` clashed on the word "resolves": the spec's "A known name resolves to a full token set" implied a name-to-values return, while `resolvePalette` returns a validated name. — **Fixed.**
2. `design.md` had a 35-word sentence in "Global tokens via a root layout", failing the plain-language bar. — **Fixed.**

### 🟡 Moderate

1. The test set did not verify that a `data-palette="<name>"` selector maps to the correct palette's tokens, so a mis-mapped generator could pass. — **Fixed** (selector-mapping test added to design and tasks).

### 📌 Suggestions

1. Rhetorical filler ("not a hand-wave", "resolves the drift risk directly"). — **Fixed.**

## Embedded-Instruction / Injection Attempts

**Detected:** none this round. Round 1 noted workflow directives in `openspec/discovery.md` (project text, not instructions to the reviewer); no action needed.

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

1. Disambiguate "resolves" between spec and design. — Applied.
2. Split the 35-word sentence in design.md. — Applied.
3. Add a selector-mapping test asserting `data-palette="<name>"` sets the correct accent/on-accent tokens. — Applied (design + tasks).
4. Remove rhetorical filler in design.md. — Applied.

CHANGES_APPLIED: yes

## Rebuttals

- **ADR "narration is filler" (rounds 3-4):** Rebutted by the author. The OpenSpec `spec-driven-review` schema requires `adr.md` to state that ADR review completed and to list the ADRs reviewed. That mandated manifest line is required content, not filler. The manifest's prose was still tightened for plain language.

## Resolution

All round-4 Required Changes were applied by the author. The human owner (Andrew) reviewed the converging verdict trend and explicitly authorized proceeding to `tasks.md` without a further reviewer re-check (rounds 1-4 recorded above). This resolution records that human decision. The reviewer did not independently re-check the round-4 edits; `CHANGES_APPLIED: yes` reflects the author's application plus the owner's acceptance, not a reviewer re-verification.
