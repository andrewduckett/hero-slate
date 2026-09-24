## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model Gemini 3.1 Pro (High) via `agy` CLI in plan (read-only) mode
- **Tool restrictions**: read-only: view, grep, glob only
- **Artifacts reviewed**: proposal.md, design.md, specs/dndbeyond-ingest/spec.md, adr.md, relevant source files

## Findings

### 🔴 Critical (blocking)

- **Missing mechanical definition for manual skill overrides in `spec.md`:** The spec ("Requirement: Skill facts") states that a skill's bonus is `null` if it "has a manual value set on D&D Beyond". It fails to define how to mechanically extract this from the JSON. The `design.md` document specifies checking if a `characterValues` entry has the skill entity type (`1958004211`) as its `valueTypeId`, but this essential mechanical logic is omitted from the spec, making the requirement unassertable.
- **Missing mechanical definition for weapon magic bonuses in `spec.md`:** The spec ("Requirement: Weapon attack and damage numbers") requires adding "the weapon's magic bonus" and failing to unknown if the digest "finds no readable magic bonus on it". It fails to define where in the JSON this bonus lives or how to extract it (e.g., checking the item's own modifiers array for a `type: "bonus"` and `subType: "magic"` entry).
- **Missing definition for weapon category mapping in `spec.md`:** The spec says a character is proficient if its modifiers grant "the weapon's category (simple or martial)". It fails to define that `categoryId: 1` maps to the `simple-weapons` modifier subType and `categoryId: 2` maps to the `martial-weapons` modifier subType.

### 🟡 Moderate

- **Plain Language (ISO 24495) violations:** `spec.md` contains two sentences that exceed the 30-word limit.
  - "When the character has a manual value set on D&D Beyond for a skill, that skill's bonus SHALL be null, and bonusReason SHALL say that D&D Beyond holds a manual value the digest does not read." (36 words)
  - "The digest SHALL report actions: one entry for each action in the class, race, background, and feat groups of actions, and one entry for each distinct equipped weapon name in the inventory." (32 words)

### 📌 Suggestions

- **Define flat bonus modifier subTypes:** In `spec.md` ("Requirement: Weapon attack and damage numbers"), explicitly list the modifier `subType`s that constitute a "flat bonus modifier on weapon attack or damage rolls" (e.g., `ranged-weapon-attacks`, `melee-weapon-attacks`, `weapon-attacks`) to remove ambiguity.

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE WITH CHANGES)

1. In `spec.md` under "Requirement: Skill facts", explicitly define how to mechanically detect a manual skill value from the JSON payload (e.g., a `characterValues` entry where `valueTypeId` equals the skill entity type ID `"1958004211"`), matching the logic proposed in `design.md`.
2. In `spec.md` under "Requirement: Weapon attack and damage numbers", mechanically define how to find the "weapon's magic bonus" in the JSON (e.g., checking the item's own modifiers array for a `type: "bonus"` and `subType: "magic"` entry).
3. In `spec.md` under "Requirement: Weapon attack and damage numbers", explicitly define the mapping between the JSON `categoryId` and the proficiency modifier subTypes (i.e., `categoryId: 1` maps to `simple-weapons` and `categoryId: 2` maps to `martial-weapons`).
4. In `spec.md`, split or revise the two identified sentences exceeding the 30-word limit to comply with the plain language requirement.

CHANGES_APPLIED: yes

## Rebuttals

Author responses. Each Required Change was fixed, and the reviewer re-checked every one in a follow-up pass.

- **RC1 (manual skill value)**: fixed. The skill-facts requirement now defines a manual value as a `characterValues` entry with `valueTypeId` 1958004211 and the skill's id as `valueId`. The author also made it fail safe: an unknown skill id makes every skill unknown. A new scenario covers this, and design D4 records the partly confirmed id table. Accepted by reviewer: "within scope".
- **RC2 (weapon magic bonus)**: fixed. The magic bonus is now the sum of `bonus`/`magic` entries in the weapon's `grantedModifiers`. The unknown case is now a weapon marked `magic` with a bonus of 0. Accepted by reviewer.
- **RC3 (weapon category)**: fixed. `categoryId` 1 maps to `simple-weapons` and 2 to `martial-weapons`, and a weapon's own proficiency uses its hyphenated name. Accepted by reviewer.
- **RC4 (sentence length)**: fixed. Both sentences are split. Accepted by reviewer.
- **Suggestion (flat bonus sub-types)**: adopted. The spec lists the six weapon attack and damage sub-types, and names the `monk-weapon` modifier type.

Author note on metadata: the reviewer ran with no tool access. Headless `agy` denied both file reads and commands, so the author inlined every reviewed file into the prompt. The reviewer made no writes.

Re-check output (verbatim):

> RC1: accepted
> RC2: accepted
> RC3: accepted
> RC4: accepted
> Suggestion on flat bonus sub-types: addressed
> Author's extra edits on unknown skill ids, a new scenario, and a design note: within scope
> CHANGES_APPLIED: yes
