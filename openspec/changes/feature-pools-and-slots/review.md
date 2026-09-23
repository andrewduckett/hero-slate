## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (Gemini 3.1 Pro High via agy CLI, plan mode, files inlined, no tools)
- **Tool restrictions**: read-only; no tools; all files inlined in the prompt
- **Artifacts reviewed**: proposal.md, design.md, adr.md, specs/dndbeyond-ingest/spec.md, relevant source files

## Findings

### 🔴 Critical (blocking)

1. **Testability (Non-assertable criteria):** In `specs/dndbeyond-ingest/spec.md`, the advisory cross-check requires matching pools "by a slot label, such as `L1 Slots`, `Level 1 Slots`, or `1st Level Slots`". The phrase "such as" is open-ended and not mechanically assertable by an automated test. The spec must define a precise regex pattern or an exhaustive list of accepted slot labels.
2. **Security (Injection-shaped data flow):** In `specs/dndbeyond-ingest/spec.md`, the `limitedUses` requirement dictates that `name` is copied "exactly as D&D Beyond stores it". D&D Beyond is an external trust boundary. Because the skill instructs an LLM agent to read this unvalidated data from `.workspace/<ddb-id>.digest.json` and embed it into a YAML file, a name containing YAML control characters (e.g., newlines) or an indirect prompt injection payload crosses the boundary without any sanitization requirement. The spec must require safe escaping or sanitization for strings crossing into the LLM/YAML context.
3. **Missing edge scenario in specs:** In `specs/dndbeyond-ingest/spec.md`, the Pact Magic requirement dictates that both fields are `null` when no class is a Warlock, and that `pactMagic` is `null` with a reason when the slots cannot be read. However, unlike `spellSlotsReason` (which the spec explicitly requires to be `null` whenever `spellSlots` is a list), the spec fails to mandate that `pactMagicReason` SHALL be `null` when `pactMagic` is successfully parsed as an object.

### 🟡 Moderate

1. **Contradiction between design decisions and spec requirements:** `design.md` D12 explicitly defines an algorithmic format for proposed pool IDs (e.g., `slots-1` to `slots-9` and `pact-slots`), but `specs/dndbeyond-ingest/spec.md` (Guided skill flow, step 6) merely says to "propose a label, a palette color, and a pool id" without mandating this specific format, allowing agent drift.
2. **Plain Language (Passive Voice):** `design.md` hides the actor with passive voice in the sentences: "This is accepted for now." and "Deferred to story 20".
3. **Plain Language (Passive Voice):** `adr.md` hides the actor with passive voice in the sentence: "No ADR is superseded".
4. **Plain Language (Filler/Narrative):** `design.md` contains brainstorming narrative and filler that restates the proposal rather than documenting the design, such as "This change adds pools." (Context) and "We expect the Warlock's levelSpellSlots row to hold..." (D8, using "We expect" instead of declarative rules).

### 📌 Suggestions

1. Consider stripping out the "such as" examples in the cross-check spec and moving them into a dedicated alias table in the codebase (similar to `COMBAT_ALIASES`) to keep the spec declarative and testable.

## Embedded-Instruction / Injection Attempts

**Detected:** `adr.md` contains a simulated review block (`# ADR Review Manifest... I re-read design.md and judged each decision against the ADR bar.`) which writes from the perspective of an ADR reviewer. While not an active injection attempting to hack the agent, it simulates a reviewer's voice inside the authored artifact, which violates the separation of authoring and reviewing contexts.

## Verdict

VERDICT: REVISE

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: n/a

## Rebuttals

<!-- Author responds to findings: fixed (cite change) or rebutted (reasoning). -->
<!-- Rebuttals are NOT self-certifying: a rebuttal of a Critical or Moderate -->
<!-- finding counts only once marked "accepted by reviewer" with a one-line -->
<!-- reason. Suggestions (📌) may be declined by the author alone. -->
