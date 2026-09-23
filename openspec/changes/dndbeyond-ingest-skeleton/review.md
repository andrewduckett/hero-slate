## Review Metadata

- **Review round**: 2
- **Prior round**: Round 1 (Gemini 3.1 Pro High): REVISE - 5 critical, 2 moderate, 2 suggestions; author fixed or rebutted each (see prior review below)
- **Reviewer context**: cross-model (Gemini 3.1 Pro High via agy CLI, plan mode)
- **Tool restrictions**: read-only
- **Artifacts reviewed**: proposal.md, design.md, specs/dndbeyond-ingest/spec.md, docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md, relevant source files

## Findings

### 🔴 Critical (blocking)

- **Unstated Assumption / Contradiction (D&D Beyond API `null` semantics)**: `specs/dndbeyond-ingest/spec.md` states: "The digest tool SHALL treat a field it reads as unreadable when the field is missing or has an unexpected type. It SHALL never treat such a field as empty or zero." However, the D&D Beyond API extensively uses `null` to represent "no bonus" (e.g., `"bonusHitPoints": null` in the Urven fixture), and standard JSON APIs often omit keys for empty optional collections (e.g., missing `modifiers.item`). If the tool strictly treats these as "missing or unexpected" and therefore "unreadable", it will fail (exit code 5) on valid character data. The spec must explicitly permit the tool to map expected `null` values or missing optional collections to zero/empty where semantically correct.

### 🟡 Moderate

- **Scope Creep vs. Discovery Story 16**: `proposal.md` and `specs/dndbeyond-ingest/spec.md` mandate that the digest compute `proficiencyBonus`. However, `proficiencyBonus` is not listed in Story 16's explicit scope in `openspec/discovery.md` (`Stats (six abilities; AC/speed; initiative from DEX)`). It is only utilized in Story 18 (for the "Strengths" section skill bonuses). Computing it now is scope creep and should be deferred to Story 18.
- **PLAIN LANGUAGE (ISO 24495) Violations**:
  - **Passive voice**: `proposal.md` says "The work is split by kind:" (hides the actor; prefer "We split the work by kind:" or "The design splits the work by kind:").
  - **Passive voice**: `design.md` says "Every number in the digest is computed by tested code, never by the agent." (prefer "Tested code computes every number in the digest, never the agent.").
  - **Passive voice**: `adr.md` says "The other decisions are recorded in `design.md`" (prefer "`design.md` records the other decisions").

### 📌 Suggestions

- **Clarify multiple Unarmored Defense sources**: A character with multiple classes might have multiple Unarmored Defense features (e.g., Monk and Barbarian). The spec implies the tool computes AC from those sources, but could clarify if it should calculate all applicable and pick the highest, or report `null` if multiple conflict, to save the developer from guessing the resolution logic.

## Embedded-Instruction / Injection Attempts

**Detected:** none detected

## Verdict

VERDICT: REVISE

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: n/a

## Rebuttals

- 🔴 **Agent writes to `static/`**: accepted by reviewer - tested write command with exclusive create fully secures the boundary.
- 🔴 **Modifier formula undefined**: accepted by reviewer - formula `floor((score - 10) / 2)` explicitly defined in spec and matches codebase.
- 🔴 **Pools and sections in the preview are scope creep**: accepted by reviewer - preview is properly scoped down to identity, abilities, combat, and hit points.
- 🔴 **Skill-flow scenarios are not mechanically assertable**: accepted by reviewer - manual scripted walkthrough is appropriate for testing interactive agent behavior.
- 🔴 **Plain language**: accepted by reviewer - passive voice and narrative removed, vocabulary standardized.
- 🟡 **D&D Beyond shape depth**: accepted by reviewer - unreadable field handling prevents silent failures from unexpected shapes.
- 🟡 **Digest file not in the skill flow**: accepted by reviewer - digest file is properly chained through workspace.
- 📌 **Use `tsx`**: declined.
- 📌 **Document D&D Beyond stat ids**: accepted.

_Round-2 author response pending._
