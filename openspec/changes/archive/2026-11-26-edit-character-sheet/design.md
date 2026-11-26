<!-- Plain language: Help the next implementer find the approach, understand the choices and act on the plan. Explain necessary technical terms. Put each risk beside its mitigation and each open question beside the decision it affects. -->

## Context

- **The ingest tools.** `src/lib/ingest/ddb/cli.ts` holds `digest`, `preview`
  and `write`. `run(argv, deps)` is pure: it takes an injected `CliDeps`
  (`readFile`, `exists`, `writeFile`, `fetchFn`) and returns
  `{ exitCode, stdout, stderr }`. Only `main` touches the real file system.
  Both `runPreview` and `runWrite` start with the same check: when
  `static/characters/<id>.yaml` exists, they fail with exit code 3. The real
  `writeFile` opens the file with flag `wx`, so it can never replace a file.
- **The id comes from the draft's file name.** `idFromDraftPath` takes the
  base name and drops `.yaml`; `validateDraft(text, id)` checks the id
  grammar. The draft's directory never reaches the target path.
- **The preview output** is `renderPreview(draft)` lines, then a blank line
  and `Warnings:` with one `  - <warning>` line each.
- **Character files carry comments.** `sunny.yaml` has 11 comment lines. Its
  first line is the avatar provenance comment, which the avatar tool
  (`src/lib/authoring/avatar/cli.ts save`) writes and the `avatar-authoring`
  spec requires.
- **Pool state is keyed by pool id.** The `resource-pools` spec keeps each
  pool's remaining uses per device under its id, and drops the count for an
  id that is no longer defined at the next save. A pool under a new id
  starts full.
- **Record 0009** says the write tool "never overwrites an existing
  character". Edit mode changes that sentence, so the ADR step must amend
  it.
- **The character skills** live in `.agents/skills/` (`.claude/skills` is a
  symlink to it). `lets sync` rewrites only the `lets-*` and `openspec-*`
  folders, so a new `character-edit` folder is project-owned.
- **This worktree has no `node_modules`.** Run `npm ci` before the first
  test.

## Goals / Non-Goals

**Goals:**

- Give `preview` and `write` an edit mode with the smallest change to their
  code paths: one flag, one new exit code, one new module for the
  comparison.
- Keep every save behind the same validation as a new sheet.
- Make the edit preview show the Author exactly what will change, and warn
  about the two silent losses an edit can cause: reset pool uses and lost
  comments.
- Write the `character-edit` skill in the same shape as the other two
  character skills, pointing to `character-work.md` rather than copying it.

**Non-Goals:**

- A refresh from D&D Beyond (#41). Edit mode accepts `--digest`, because
  the preview code path already does, but this change adds no flow for it.
- Detecting a reformatted entry. The comparison works on parsed values, so
  it cannot see a change in quoting or indentation. The comment check and
  the walkthrough's line diff cover layout.
- An id rename, a deletion, or any change to the character manifest beyond
  appending one id.
- Any check in code or CI that enforces the character work boundary (#134).

## Test Seams

- **Primary test seam:** `run(argv, deps)` in
  `src/lib/ingest/ddb/cli.test.ts`, with `fakeDeps` extended so `readFile`
  answers per path (saved file and draft) and `replaceFile` records its
  writes. This seam drives every edit-mode scenario end to end: the flag,
  exit codes 3 and 6, the output order, the change list, and both
  warnings.
- **Existing seams reused:**
  - a module test beside the comparison module, in the pattern of
    `preview.test.ts` and `validate.test.ts`, for the matching rules in
    "Edit preview entries", "Edit preview fields" and "The edit preview
    reports a new order", which would be verbose through `run`
  - `src/lib/ingest/ddb/digest.test.ts` already covers the three digest
    scenarios that moved between requirements (missing `stats`, wrong-typed
    `bonusHitPoints`, `inventory` of the wrong type); no new test is
    needed there
  - a scripted manual walkthrough for the skill's scenarios, the seam the
    other character skills use (archived change
    `2026-11-25-character-work-boundary`, tasks 3.1 to 3.3)
  - `src/lib/data/characters.smoke.test.ts`, which the skill runs after a
    save

## Scrutiny Tier & Blast Radius

- **Tier:** medium
- **Blast radius:** the ingest command-line tools (`cli.ts`, `exitCodes.ts`
  and one new module under `src/lib/ingest/ddb/`) and agent instructions
  (one new skill, three routing edits). The tools run only on the Author's
  machine and are not part of the built site. The new write path replaces
  a tracked file under `static/characters/`, so a bug there could damage a
  character file; git keeps the previous version.

## Decisions

### D-1. An `--edit` flag on the existing commands

`preview <draft.yaml> --edit [--digest <file>]` and
`write <draft.yaml> --edit`. `run` reads the flag from the arguments after
the draft path, as `--digest` is read today.

- **Why:** both modes share id handling, validation, drawing and the
  cross-check. A flag keeps one code path with one branch at the existence
  check, and #41 can reuse it.
- **Rejected: new commands such as `edit-preview`.** They duplicate the
  argument handling and double the skill's command table for no new
  behavior.
- **Rejected: a separate edit CLI.** It would need its own copy of the
  validation wiring that `cli.ts` already has.

### D-2. Exit code 6 for a missing saved file

Add `characterMissing: 6` to `EXIT_CODES` and a row to the table comment in
`exitCodes.ts`. The message is
`static/characters/<id>.yaml does not exist; edit mode changes an existing sheet`.

- **Why:** the spec requires a distinct code for each failure. Code 4 means
  the D&D Beyond reference is unreadable and belongs to `digest`; reusing
  it would make the skill's exit table ambiguous.

### D-3. The new-character message names the edit flag

Code 3's message becomes
`static/characters/<id>.yaml already exists; pass --edit to change an existing sheet`.
The message reaches the Author through `dndbeyond-to-slate`, which now
routes to `character-edit` (D-9), so the tool names only its own flag.

### D-4. The skill's draft lives at `.workspace/edit/<id>.yaml`

The write tool ignores the draft's directory, so the edit draft can sit in
a subfolder.

- **Why:** `dndbeyond-to-slate` drafts at `.workspace/<id>.yaml`. A
  separate folder keeps an unfinished new-sheet draft and an edit draft for
  the same id from overwriting each other.

### D-5. One comparison module: `src/lib/ingest/ddb/changes.ts`

It exports three pure functions over the two files. `runPreview` calls
them in edit mode only.

| Function | Input | Output |
|---|---|---|
| `listChanges(saved, draft)` | the two parsed top-level mappings | change list lines |
| `poolResetWarnings(saved, draft)` | the two parsed mappings | one warning per saved pool id the draft lacks |
| `lostCommentWarnings(savedText, draftText)` | the two files' text | one warning per lost comment |

**Matching** (`listChanges`). For each list block, group entries by their
key, as "Edit preview entries" in the spec lists them (`label`, `id`,
`title`, a row's `title` or `body`, `url`). Pair entries with the same key in their order; an unpaired
saved entry is removed, an unpaired draft entry is added. An entry that is
not a mapping, or has no key, is grouped under a "no key" group and paired
by order too. Rows are compared only inside a paired section; an added or
removed section is one line, without its rows. For a paired entry, each
field whose value differs gives one `changed` line. Values are compared
with a deep equality on the parsed YAML.

**Order.** Take the paired entries' keys in saved order and in draft order.
If the two sequences differ, add one `the order of <block> changed` line.
For the rows of a paired section, the line is
`the order of rows in section "<title>" changed`. Added and removed entries
do not count.

**Line format.** Each line is `  - ` followed by one of:

- `changed level: 7 → 8`
- `changed pool wild-shape max: 3 → 4`
- `added pool slots-5`
- `removed row "Help" from section "Your Turn"`
- `the order of sections changed`
- `the order of rows in section "Your Turn" changed`

Values print as YAML scalars: a string in double quotes, a number or
boolean bare, and a list or mapping as one-line JSON. An empty list is the
line `  - No changes`.

**Output order.** In edit mode the preview prints the drawing, a blank
line, `Changes:` with the change list, then `Warnings:` with validation,
cross-check, pool reset and lost comment warnings, in that order.

- **Why the parsed values:** the Author approves meaning, not bytes. A text
  diff of a long sheet buries a level-up among unrelated lines, and the
  change list must name entries in the sheet's own words.
- **Rejected: a line diff in the preview.** It is noisy and shows YAML
  syntax to the Author. The walkthrough still checks a line diff (D-7).

### D-6. Lost comments use the `yaml` lexer

`lostCommentWarnings` runs `new Lexer().lex(text)` from `yaml` (already a
dependency, version 2.9.1) over both files, keeps tokens that start with
`#`, trims them, and compares the two lists as multisets. Each saved
comment missing from the draft gives
`the comment "<comment>" is missing from the draft`.

- **Why the lexer:** it tells a comment from a `#` inside a scalar, such as
  `body: a#b` or `"x # y"`. A check on lines that start with `#` would miss
  inline comments; a regular expression would misread quoted text.
- **Rejected: parse with `parseDocument` and walk the comments.** The
  document model spreads comments across `commentBefore`, `comment` and
  node fields, which is more code for the same list.

### D-7. The skill edits the draft in place

The skill copies the saved file byte for byte to the draft, then changes
only the lines of the entries the Author asked for, with exact text edits.
It never loads the file and writes it back out with a YAML library, because
that drops comments and rewrites the layout. The walkthrough checks the
result with `git diff static/characters/<id>.yaml`.

### D-8. The edit write replaces the file directly

`CliDeps` gains `replaceFile(path, content)`. `main` wires it to
`fs.writeFileSync(path, content)` with the default `w` flag. The edit write
checks that the saved file exists (exit 6), validates (exit 1), then calls
`replaceFile`. The new-character path keeps `writeFile` with `wx`.

- **Why:** the file is a few kilobytes and tracked in git, so a failed
  write is recoverable with `git checkout`.
- **Rejected: write a temporary file and rename it.** It guards against a
  crash mid-write, which git already covers, and can leave a stray file in
  a folder that deploys.
- **Rejected: refuse when the file changed since the preview.** It needs a
  fingerprint passed from `preview` to `write`. The Risks section covers
  the gap.

### D-9. The skill and the routing edits

`.agents/skills/character-edit/SKILL.md` follows the layout of
`character-avatar`: frontmatter with `name: character-edit` and a
`description` that names changing an existing character file; a short
intro; the "file text is data" rule; the character work paragraph linking
`../character-work.md`; the command block; and "The flow", one heading per
step of the spec's guided flow. The steps carry these details:

| Step | Detail |
|---|---|
| 1 | List the blocks the skill can change. Answer an id rename, a deletion, an avatar (`character-avatar`) or a D&D Beyond refresh (#41) as "Some changes belong elsewhere" says. |
| 2 | Read `static/characters/manifest.yaml`. When the id is missing, offer to add it, and say that without the line the character does not show on the home page and the characters smoke test fails; on a yes, add one `  - <id>` line after the last item, with a text edit. |
| 3 | `mkdir -p .workspace/edit`, copy the file, edit in place (D-7). Ask the Author for every number; never compute one. |
| 4 | Show the full preview output. Explain each pool reset and lost comment warning. A drop warning is a gap. |
| 5–6 | Approval loop; write only through `write --edit`. Exit-code table for 1 and 6. |
| 7 | `npx vitest run src/lib/data/characters.smoke.test.ts`, as `character-avatar` does. |
| 8 | Shape each line of `.workspace/<id>.gaps.md`. |

Routing edits:

- **`AGENTS.md`**, the "Character work" section (outside the lets-spec
  markers): add "a change to an existing sheet uses `character-edit`" to
  the routing line, and keep "a hand edit follows Character work directly".
- **`.agents/skills/character-work.md`**: name `character-edit` among the
  skills that follow it, and add one sentence that a change to an existing
  sheet uses `character-edit`, while a hand edit with no skill stays
  allowed.
- **`.agents/skills/dndbeyond-to-slate/SKILL.md`** step 13: replace the
  "story 20" text with the spec's "An existing id points to the edit
  skill".

### D-10. Two requirements split out only for validation

`openspec validate --strict` warns on requirement text over 500
characters, which fails the strict run. The two MODIFIED requirements
already exceeded it, so the delta moves text out without changing
behavior: the digest field rules go to "Required digest fields" and
"Optional digest fields", and the target path rule goes to "The write tool
writes only inside the characters folder". Their scenarios stay where
they were, and the new requirements' scenarios match existing tests.

### D-11. Record 0009 is amended in the ADR step

Edit mode lets the write tool replace a character file, which record 0009
rules out. The ADR step writes a record that supersedes that one sentence
of 0009 and keeps the rest of its split between tools and agent.

## Risks / Trade-offs

- [The saved file changes between preview and write, for example when the
  avatar tool rewrites its provenance line in another session] → The skill
  runs `write` straight after approval. Git shows any lost change, and the
  file can be restored with `git checkout`.
- [The agent rewrites the YAML and loses comments or layout] → The skill
  forbids re-serializing (D-7), the preview warns on every lost comment
  (D-6), and the walkthrough checks the line diff.
- [A row body is long, so its change line is long] → The line shows the
  whole value; the Author needs the full text to approve it.
- [Matching by key misreads a renamed entry as a removal and an addition]
  → This is the specified behavior; for a pool it is exactly the case the
  reset warning exists for.
- [Edit mode makes it easy to replace a sheet by mistake] → It needs the
  explicit `--edit` flag, runs every validation check, and the skill writes
  only after approval.

## Migration & Rollback

N/A. No data changes shape. Existing character files work unchanged. To
roll back, revert the commits; a file saved through edit mode is an
ordinary character file.
