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

Author responses to round 1. Each response is marked fixed, or rebutted with reasons.

- 🔴 **1. Open-ended slot labels**: fixed. The spec now defines exactly five slot-label forms, with `N` from 1 to 9 and a matching ordinal. It defines the pact labels, case and space handling, and new scenarios for every form, a non-matching label, and a missing level. Design D11 names one anchored regular expression.
- 🔴 **2. Digest names crossing into the agent and YAML**: partly fixed, partly rebutted.
  - Fixed: the guided skill flow now requires the skill to treat every digest string as data, and to tell the Author about a name that reads like an instruction. It adds a scenario for this. Design D13 lists the three guards: the skill rule, the preview's YAML parse (a broken draft is an error, so the write tool refuses it), and the Author's approval before any write.
  - Rebutted: the digest does not strip or escape names. The spec already keeps names exactly as D&D Beyond stores them, as story 16 does for the character name. The agent writes the final label, and the app renders labels as escaped text (`{pool.label}` in `ResourcePoolsBlock.svelte`), not HTML.
- 🔴 **3. `pactMagicReason` on success**: fixed. The spec now requires `pactMagicReason` to be `null` when `pactMagic` is an object, and the Warlock scenario asserts it.
- 🟡 **1. Pool id format only in the design**: fixed. Step 6 of the guided skill flow now states the id forms: lowercase with hyphens, `slots-N`, and `pact-slots`. D12 points to the spec.
- 🟡 **2. Passive voice in `design.md`**: fixed. The text now reads "The Author deferred this to story 20" and "The Author accepted this gap".
- 🟡 **3. Passive voice in `adr.md`**: fixed. It now reads "No ADR names another in its Supersedes field".
- 🟡 **4. Filler in `design.md`**: fixed. The design drops "This change adds pools." D8 now reads "The module assumes that…", which states the assumption as a rule.
- **Embedded-instruction finding on `adr.md`**: rebutted. `adr.md` is the ADR-review manifest that this workflow's schema requires the author to write. It is not a critique of the change. To remove any doubt, it now names "the author" as the actor instead of "I".
- 📌 **Move the examples into an alias table**: declined in part. The spec now lists the exact label grammar, so it is testable. The code keeps the grammar in one regular expression (D11).
