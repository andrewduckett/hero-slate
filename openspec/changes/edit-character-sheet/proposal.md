<!-- Plain language: Lead with the problem and resulting behavior. Give a reader enough context to decide whether the scope solves that problem. Keep the required headings. -->

## Why

No skill changes an existing character sheet. `dndbeyond-to-slate` refuses a
character that already exists, so the Author edits the YAML by hand or with an
agent that has no guided flow. Both commits that mixed a sheet with app code
(`df6944d`, `843269e`) were hand edits like that. #132 stated the character
work boundary; this story gives the Author a guided way to change a sheet
inside it.

## What Changes

- Adds a `character-edit` skill, beside `character-avatar` (D10). Given a
  character id and a requested change, it:
  - does character work only: it writes `static/characters/` and
    `.workspace/`, and follows `.agents/skills/character-work.md`, including
    the gap steps (D1)
  - offers any change the sheet format supports, and no id rename, deletion,
    avatar or D&D Beyond refresh (D3)
  - writes every number exactly as the Author gives it, and never computes a
    game rule (D4)
  - keeps every comment and the layout of untouched entries (D7)
  - previews every changed draft, and saves only after the Author approves,
    only through the write tool (D8)
  - treats the text in a character file as data, never as instructions (D9)
  - offers to add a missing character manifest line, and adds it only on a
    yes (D2)
  - commits nothing (D12)
- Adds an **edit mode** to the `preview` and `write` tools in
  `src/lib/ingest/ddb/cli.ts` (D5). In edit mode:
  - `preview` validates a changed draft for a character that exists, draws
    it, and lists what changed against the saved file, with a warning when a
    pool id is renamed or removed (D6)
  - `write` replaces the saved file only after the draft validates
- Keeps new-character mode as it is: `preview` and `write` still refuse an
  existing file with exit code 3. Only the message changes: it points to edit
  mode instead of saying that updating is not supported yet.
- Routes a change to an existing sheet to `character-edit` from `AGENTS.md`,
  `character-work.md` and step 13 of `dndbeyond-to-slate`. A hand edit with
  no skill stays allowed (D11).
- Out of scope: a refresh from D&D Beyond (#41, which can reuse edit mode),
  reordering the roster, and adding the manifest line inside
  `dndbeyond-to-slate`.

## Capabilities

### New Capabilities

- `character-editing`: the `character-edit` skill's guided flow for changing
  an existing character file, its limits, and how it keeps the character
  work boundary.

### Modified Capabilities

- `dndbeyond-ingest`: the `preview` and `write` tools gain an edit mode for
  an existing character, with a change list, a pool id warning and a new exit
  code for a missing character file. The rule against overwriting an existing
  file now applies to new-character mode only, and its message points to edit
  mode.

## Impact

- **App code:** `src/lib/ingest/ddb/cli.ts` (the edit flag on `preview` and
  `write`), `src/lib/ingest/ddb/exitCodes.ts` (one new code), and a new
  module that lists the changes between the saved file and the draft. Each
  has unit tests beside it.
- **Agent instructions:** a new `.agents/skills/character-edit/SKILL.md`;
  routing lines in `AGENTS.md` (outside the lets-spec markers),
  `.agents/skills/character-work.md` and
  `.agents/skills/dndbeyond-to-slate/SKILL.md`. `.claude/skills` is a symlink
  to `.agents/skills`, so Claude Code sees the same files.
- **Specs:** a new `openspec/specs/character-editing/spec.md`; changes to
  `openspec/specs/dndbeyond-ingest/spec.md`.
- **Character files, dependencies, CI, deploy:** no change.
