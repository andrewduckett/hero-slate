## Review Metadata

- **Review round**: 3
- **Prior round**: Round 1: REVISE (5 critical, 2 moderate). Round 2: REVISE (1 critical, 2 moderate, 1 suggestion); all round-1 responses accepted by reviewer; author fixed each round-2 finding (see prior review below)
- **Reviewer context**: cross-model (Gemini 3.1 Pro High via agy CLI, plan mode)
- **Tool restrictions**: read-only

## Findings

### 🔴 Critical (blocking)

- **PLAIN LANGUAGE (ISO 24495) Violations**:
  - **Sentence over 30 words**: `proposal.md` contains a 38-word sentence that must be split: "warns, without blocking, when a draft number disagrees with the digest (level, ability scores, Armor Class, speed, initiative, maximum hit points); it matches entries by label and its common aliases, and skips a label it does not recognize".
  - **Passive voice**: `design.md` and `docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md` state "cannot be tested". (Hides the actor; prefer "defies testing" or "we cannot test").
  - **Passive voice**: `design.md` states "static/ is published with the site." (Hides the actor; prefer "The build publishes static/").
  - **Passive voice**: `design.md` states "vite-node is already installed as a dependency". (Hides the actor; prefer "Vitest already installs vite-node").
  - **Passive voice**: `design.md` states "An unmatched label is skipped silently" and "A `null` digest fact is skipped." (Hides the actor; prefer "The cross-check silently skips...").
  - **Passive voice**: `specs/dndbeyond-ingest/spec.md` states "updating an existing sheet is not supported yet" and "a draft that cannot be written". (Prefer "the tool does not support updating" and "a draft the tool cannot write").
  - **Passive voice**: `docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md` states "A preview tool checks the draft before anything is written." (Prefer "before the tool writes anything").
- **Unstated Assumption (D&D Beyond Modifier Mapping)**: `specs/dndbeyond-ingest/spec.md` requires the digest to compute final ability scores by applying "flat bonuses" and hit points by applying "flat per-level hit point bonuses". However, the `urven.json` fixture shows that ability score modifiers (e.g., `subType: "dexterity-score"`) have `statId: null`. The developer is left to assume they must parse the `subType` string to link the modifier to the correct ability, which is an unstated mapping. The spec or design must explicitly acknowledge mapping these `subType` strings (e.g., `dexterity-score` -> Dexterity) or document it as an open question, to prevent the tool from dropping these bonuses due to the null `statId`.

### 🟡 Moderate

- **Elegant Variation**: `proposal.md` refers to the digest tool inconsistently. It first states "A script computes facts", then "The `digest` command fetches...", while the design uses "Tested tools compute...". Stick to a single term (e.g., "The digest tool") to adhere to the ISO 24495 principle of one word per concept.

### 📌 Suggestions

- **Validate DDB ID strictly**: `specs/dndbeyond-ingest/spec.md` requires the digest tool to "extract the numeric character id from the character reference". While safe in a local tool context, explicitly specifying that the extracted ID must consist *only* of digits before appending it to the D&D Beyond API URL would completely eliminate any theoretical edge cases with path traversal.

## Embedded-Instruction / Injection Attempts

**Detected:** none detected

## Verdict

VERDICT: REVISE

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: n/a

## Rebuttals

- 🔴 **`null` semantics**: accepted by reviewer - explicitly classifying required vs optional fields cleanly handles DDB's null semantics.
- 🟡 **`proficiencyBonus` scope creep**: accepted by reviewer - removal aligns the spec perfectly with story 16's scoped bounds.
- 🟡 **Plain language (three passives)**: accepted by reviewer - passive voice resolved in all three cited instances.

_Round-3 author response pending._
