## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (Gemini 3.1 Pro High via agy CLI, plan mode)
- **Tool restrictions**: read-only
- **Artifacts reviewed**: proposal.md, design.md, specs/dndbeyond-ingest/spec.md, docs/decisions/0009-ingest-tools-compute-facts-the-agent-writes-the-sheet.md, relevant source files

## Findings

### 🔴 Critical (blocking)

- **Security - Agent writes to public static/ directory**: The design delegates the file write of the final YAML to the LLM agent (`proposal.md`: "the agent copies the draft to `static/characters/<id>.yaml`"). Writing to the publicly deployed `static/` directory crosses a trust boundary without mechanical validation, allowing the agent to bypass preview checks, alter content post-approval, or write malicious files (e.g., `index.html`). A tested tool command (e.g., a `write` command) must perform the validated copy to strictly enforce the destination, extension, and content integrity.
- **Unstated Assumption - Modifier math**: The spec repeatedly requires calculations using a stat's "modifier" (e.g., `specs/dndbeyond-ingest/spec.md`: "plus the Constitution modifier times the total level"). However, the formula to derive a modifier from a base score (e.g., `floor((score - 10) / 2)`) is never defined, creating a wrong-direction risk for implementation.
- **Scope Creep vs. Discovery Story 16**: Story 16 explicitly declares "out: any opt-in sections (pools, slots, Your Turn, skills, spells)". However, `specs/dndbeyond-ingest/spec.md` mandates that the `preview` tool "SHALL show every block the app would render: ... pools, and sections" and includes a test scenario for them. Building ASCII renderers for these complex blocks is gold-plating for the skeleton phase.
- **Testability - Skill flow non-assertable**: The `Guided skill flow` requirements in `specs/dndbeyond-ingest/spec.md` contain Gherkin scenarios (e.g., "WHEN the Author asks for `ocean` instead of the proposed color THEN the skill updates the draft...") whose `THEN` conditions depend on LLM behavior. These are not mechanically assertable by standard automated tests. 
- **PLAIN LANGUAGE (ISO 24495) Violations**: This first-class criterion is violated across multiple artifacts:
  - **Sentences over 30 words**: `proposal.md`: "Out of scope: resource pools and spell slots (story 17), Your Turn and skill sections (story 18), spell sections (story 19), updating an existing sheet (story 20), and access to private characters." (32 words).
  - **Passive voice hiding the actor**: `specs/dndbeyond-ingest/spec.md`: "A signed string such as `\"+5\"` is parsed to a number before comparison." (Who parses it?); `design.md`: "The id is taken from the draft's file name" (Who takes it?).
  - **Brainstorming narrative**: `design.md` D1, D2, and D3 explain rejected alternatives using historical narrative ("Rejected earlier in exploration", "as the proposal first said", "The spike showed that..."). This belongs in a PR description, not a durable spec.
  - **Elegant variation**: `specs/dndbeyond-ingest/spec.md` uses "URL or ID" and "reference" interchangeably for the input, and mixes "facts", "numbers", and "values" when referring to the digest output.

### 🟡 Moderate

- **Missing Edge Case - D&D Beyond API shape limits**: The spec handles missing keys (unexpected shape, exit 5), but assumes all inventory and modifiers are flat arrays. If D&D Beyond uses nested structures for equipped status or paginates `inventory`, the digest could silently drop data or fail unpredictably. The spec should clarify assumptions about the payload depth.
- **Contradiction - Digest Passing**: `design.md` D4 states "The skill saves the digest to `.workspace/<ddb-id>.digest.json` and passes it to `preview`." But the `Guided skill flow` in `specs/dndbeyond-ingest/spec.md` does not mention this intermediate file save, creating a gap in the spec's sequence of operations.

### 📌 Suggestions

- **Cheaper alternative for CLI execution**: `design.md` D3 rejects `tsx` because it "does not read the Vite alias config". But SvelteKit generates a `tsconfig.json` with the `$lib` paths mapped, which `tsx` reads natively via `--tsconfig`. Given `tsx` avoids Vite's start-up overhead, it might be a faster alternative, though `vite-node` is already in `devDependencies`.
- **DDB stat ID mapping**: The `specs/dndbeyond-ingest/spec.md` states "ability scores, in the order Strength, Dexterity..." but DDB uses numeric `id`s (1-6) as seen in the Urven JSON. The spec could explicitly document that `1 = Strength, 2 = Dexterity`, etc., to save the developer from reverse-engineering the DDB JSON mapping.

## Embedded-Instruction / Injection Attempts

**Detected:** none detected

## Verdict

VERDICT: REVISE

## Required Changes (if APPROVE WITH CHANGES)

CHANGES_APPLIED: n/a

## Rebuttals

Author responses to round 1. Each response is either fixed or rebutted. The round-2 reviewer re-checks each one.

- 🔴 **Agent writes to `static/`**: fixed. A tested `write` command now saves the draft. It re-runs every check, uses exclusive create, and builds the path only from `static/characters/` and the validated id. Changed: spec (new requirement "The write tool saves only a valid, approved draft", exit-code table, skill flow step 8), design D4, proposal, ADR 0009.
- 🔴 **Modifier formula undefined**: fixed. The spec now defines the modifier as `floor((score - 10) / 2)`, matching `src/lib/character/modifier.ts`.
- 🔴 **Pools and sections in the preview are scope creep**: fixed. Preview and validation now cover identity, abilities, combat, and hit points only. Other top-level blocks are listed under "Not previewed". Changed: spec, design D5, proposal.
- 🔴 **Skill-flow scenarios are not mechanically assertable**: partly rebutted. They describe agent behavior, which an automated test cannot drive. The spec now says a scripted manual walkthrough validates them. The OpenSpec spec instruction allows a scenario to be "explicitly validated". Every requirement a test can assert now belongs to a tool, not the skill.
- 🔴 **Plain language**: fixed. The 32-word sentence is split. The passive "is parsed" and "the id is taken" are rewritten with named actors. Narrative phrases ("as the proposal first said", "Rejected earlier in exploration", "The spike showed") are removed or restated as facts in Context. "Character reference" is now defined once and used throughout. The digest's output is consistently called "facts".
- 🟡 **D&D Beyond shape depth**: fixed. The spec now requires the digest to treat a field with an unexpected type as unreadable (exit 5), never as empty or zero, and adds a scenario.
- 🟡 **Digest file not in the skill flow**: fixed. Skill flow step 2 now saves the digest to a workspace file, and step 7 passes it to the preview.
- 📌 **Use `tsx`**: declined. `vite-node` is already installed through Vitest, and this repo showed it resolves `$lib` and extensionless imports. `tsx` would add a package to save about one second per interactive run.
- 📌 **Document D&D Beyond stat ids**: accepted. Design Context now records that ids 1–6 stand for Strength through Charisma, which the Urven response confirms.
