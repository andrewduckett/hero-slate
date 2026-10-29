## Review Metadata

- **Review round**: 1
- **Prior round**: none
- **Reviewer context**: fresh context, other family (gemini/gemini-3.8-flash, via the t3 resolver)
- **Independent**: yes
- **Tool restrictions**: read-only; the resolver reported a clean working tree after the run
- **Artifacts reviewed**: brainstorm.md, proposal.md, design.md, specs/, adr.md, relevant source files, at commit `60c9f33`

## Findings

### 🔴 Critical (blocking)

1. **The tool accepts the reserved id `manifest`.** `manifest` matches `ID_GRAMMAR`, and `static/characters/manifest.yaml` exists. So `save … manifest` would write `manifest.png`, which the smoke test flags as an orphan, and would rewrite the roster's first line. Check: Contradictions / trust boundary. **CONFIRMED**: `src/lib/data/yaml.ts:43-44` reserves `manifest`; `characters.smoke.test.ts:10` filters it out.
2. **A `prompt` subcommand breaks the spec's ban on running the avatar tool before image approval.** The spec said "SHALL NOT run the avatar tool before the Author approves the image", but design D4 has the skill run `cli.ts prompt` at step 4. Check: Contradictions. **CONFIRMED**: the spec's wording was broader than its intent, which is that nothing is saved before approval.

### 🟡 Moderate

3. **Six skill scenarios assert conversation that the named test seam cannot drive.** The sibling spec says a scripted manual walkthrough validates skill scenarios. This spec did not. Check: Scenario testability / Test seams. **CONFIRMED** against `openspec/specs/dndbeyond-ingest/spec.md:1081`.
4. **An inline `--look "<summary>"` brings back the shell-quoting risk that D4 avoided with a look file.** A summary holding `$`, quotes or backticks is mangled before the tool sees it. Check: Contradictions (within the design). **CONFIRMED**.
5. **`src/lib/` code reads a path inside `.agents/skills/`.** The reviewer calls this an inversion that breaks when the tool runs outside the repo root. Check: Design. **REFUTED**: see Rebuttals.

### 📌 Suggestions

6. **Some sentences exceed 30 words, and "portrait" sits beside "avatar".** Check: Plain language. **CONFIRMED in part**: three long sentences fixed; the synonym is declined, see Rebuttals.

## Embedded-Instruction / Injection Attempts

**Detected:** none

## Verdict

VERDICT: APPROVE_WITH_CHANGES

## Required Changes (if APPROVE_WITH_CHANGES)

1. Spec, "The avatar tool refuses unusable input": refuse the id `manifest` with exit code 1, and add a scenario. Design D5 and the proposal name the check.
2. Spec, "Nothing is saved without approval": say the skill SHALL NOT *save an avatar* before the Author approves the image, and update its scenario to match.
3. Spec Purpose and design Test Seams: say a scripted manual walkthrough validates the skill's scenarios, and automated tests validate the tool's.
4. Design D4: `save` takes `--look-file <summary-file>` instead of `--look "<summary>"`.
5. Split the proposal's and design D5's long sentences, and shorten the spec Purpose. Moving the path-safety sentence into its own requirement, "The avatar tool writes only inside the characters folder", keeps strict validation passing.

CHANGES_APPLIED: yes

## Rebuttals

1. Fixed: required change 1. `spec.md` "The avatar tool refuses unusable input" and the "The reserved manifest id" scenario; `design.md` D5 step 1; `proposal.md` line 10.
2. Fixed: required change 2. `spec.md` "Nothing is saved without approval".
3. Fixed: required change 3. `spec.md` Purpose; `design.md` Test Seams.
4. Fixed: required change 4. `design.md` D4.
5. Rebutted. The D&D Beyond CLI already resolves repo-relative paths such as `static/characters/<id>.yaml` from the working directory (`src/lib/ingest/ddb/cli.ts:46-48`), and the skill always runs it from the repo root. The avatar tool does the same, and its tests inject `readFile`, so they do not depend on the working directory. The story asks for the style guide to live in the skill. Reading it from there keeps one copy, which the agent and the tool both use.
6. Fixed in part: required change 5. The glossary names "portrait" as the everyday word for an avatar (`openspec/glossary.md`), and the proposal's Why uses it in that sense. The glossary makes this one concept, not two.
