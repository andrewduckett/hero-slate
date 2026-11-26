<!-- Plain language: Lead with the problem and resulting behavior. Give a reader enough context to decide whether the scope solves that problem. Keep the required headings. -->

## Why

When an agent helps the Author with a character, it often suggests something
the sheet format cannot express and then changes app code to support it.
Commits `df6944d` and `843269e` each bundle a sheet with app code. No rule
tells an agent to stop, so the boundary must be stated where every agent
reads it, before the other two stories of epic #131 (#133, #134) build on it.

## What Changes

- Adds the **Character work** entry to `openspec/glossary.md` (D1). It
  arrived on this branch as commit `a52cc64`, the epic's glossary handoff.
- Adds one shared boundary reference that the character skills read. It
  says that character work:
  - writes only `static/characters/` and `.workspace/` (D2)
  - offers only what the sheet format supports today, as the current specs
    define it, and points to those specs instead of copying the format (D3)
  - handles a gap in four steps: say the sheet cannot do it, offer the
    nearest supported choice, offer to open an issue through `lets-shape`,
    then carry on with the sheet (D4)
  - never changes app code, even when the Author asks for the change now;
    the change is built later through `lets-go` (D5)
  - keeps a commit of character work to character files only, while the
    skills themselves still do not commit (D6)
- Makes `dndbeyond-to-slate` and `character-avatar` read and follow the
  shared reference (D7).
- Adds a "Character work" section to the project-owned part of `AGENTS.md`,
  with the boundary and a routing line, so a hand edit with no skill
  running follows the same rule. The lets-spec block stays untouched (D7).
- Out of scope: a skill for changing an existing sheet (#133) and any
  enforcement in code or CI (#134) (D9).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `dndbeyond-ingest`: the guided skill flow gains the character work
  boundary and the gap step (D8).
- `avatar-authoring`: the guided skill flow gains the character work
  boundary and the gap step (D8).

## Impact

- **Agent instructions:** `.agents/skills/dndbeyond-to-slate/SKILL.md`,
  `.agents/skills/character-avatar/SKILL.md`, a new shared reference beside
  them, and `AGENTS.md` outside the lets-spec markers. `.claude/skills` is a
  symlink to `.agents/skills`, so Claude Code sees the same files.
- **Specs:** `openspec/specs/dndbeyond-ingest/spec.md` and
  `openspec/specs/avatar-authoring/spec.md`.
- **Glossary:** `openspec/glossary.md` (already committed).
- **App code, tests, dependencies, CI:** no change. A scripted manual
  walkthrough of each skill validates the new scenarios, as it does for
  the skills' existing scenarios.
