## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: cross-model (gpt, gpt-6-astra, via t3)
- **Independent**: yes
- **Tool restrictions**: read-only: view, grep, glob only
- **Artifacts reviewed**: brainstorm.md, proposal.md, design.md, specs/, adr.md, relevant source files
- **Commit reviewed**: 2482572. The required changes below were applied in the next commit.
- **Effort**: low (design.md's scrutiny tier)

## Findings

### 🔴 Critical (blocking)

None.

### 🟡 Moderate

1. **The ingest delta leaves a stale 12-use rule in "Guided skill flow".** Check: spec deltas. `openspec/specs/dndbeyond-ingest/spec.md:1008` still tells the Author that the app drops a pool above 12. The delta replaced only "Draft validation", so archive would keep the contradiction. **CONFIRMED.**
2. **The pool-named readout from D7 is missing from the spec and design.** Check: assumption and decision rows. brainstorm.md D7 names the buttons and the readout, but the counter requirement and design D-e named only the buttons and the bar. A build could pass both and still leave several counters' readouts unnamed. **CONFIRMED.**

### 📌 Suggestions

3. **The browser check does not cover a 12-dot layout.** Check: test seams. design.md's risk cited `/urven`, which has 7 dots, as the check for a three-row, 12-dot pool. **CONFIRMED.**
4. **Design D-b has a sentence over 30 words.** Check: plain language. **CONFIRMED.**

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE_WITH_CHANGES)

1. Add the whole "Guided skill flow" requirement to `specs/dndbeyond-ingest/spec.md` as MODIFIED, changing only "above 12" to "above 100". Name it in proposal.md's capabilities.
2. In `specs/resource-pools/spec.md`, make the counter a group named "<label>: <n> remaining" and assert it in a scenario. Add the `role="group"` label to design D-e.
3. In design.md's risks, add a temporary, uncommitted 12-use pool to the 360 px browser check.
4. Split design D-b's long sentence without changing its decision.

CHANGES_APPLIED: yes

## Rebuttals

1. Fixed: `specs/dndbeyond-ingest/spec.md` now carries "Guided skill flow" with all 19 of its scenarios. Step 6 says "above 100". proposal.md's `dndbeyond-ingest` line names it.
2. Fixed: the "Remaining-use counter for large pools" requirement and its "Controls appear in order and name the pool" scenario now require a group named "Lay On Hands: 35 remaining". Design D-e gives the card `role="group"` with that label.
3. Fixed: design.md's first risk now loads a temporary local character with `max: 12` for the browser check, and does not commit it.
4. Fixed: design D-b is now three sentences.
