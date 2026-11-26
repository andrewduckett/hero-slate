<!-- Plain language: Lead with the problem and resulting behavior. Give a reader enough context to decide whether the scope solves that problem. Keep the required headings. -->

## Why

The character work boundary from #132 is prose that agents read, and an agent
can ignore prose. A CI check turns the boundary into a fact the Author sees
before merging: a character work pull request that changes anything outside
`static/characters/` shows a failed check.

## What Changes

- Adds a CI check that judges only a **character work pull request**: one
  whose title starts with `char:` (D1, D2). Unmarked pull requests pass, so a
  feature pull request may still change character files and code together.
- The check fails when the pull request adds, changes or deletes any file
  outside `static/characters/`, including either side of a rename that crosses
  the boundary. Files in subfolders of `static/characters/` count as inside.
  It compares the pull request with its base branch, so a stacked pull request
  is judged only on its own changes (D4).
- The check runs again when the title is edited, so adding or removing the
  mark takes effect at once (D2).
- A failure lists every outside path and gives two fixes: move that change to
  its own issue and pull request, or remove the `char:` mark if the pull
  request is not character work (D5).
- The check is advisory. It is not made a required status check, and the merge
  settings on `main` do not change (D6).
- Adds the marking rule to the boundary reference,
  `.agents/skills/character-work.md`, beside its commit rule: a pull request of
  character work gets a title that starts with `char:`, and its commits keep
  their Conventional Commits types (D3, D8).
- Adds **Character work pull request** to `openspec/glossary.md`, next to
  Character work (D7). It arrived on this branch as commit `d87eccd`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ci-checks`: gains the character work pull request check, its trigger on
  title edits, its comparison with the base branch and its failure message.
- `dndbeyond-ingest`: the character work rules gain the marking rule for a
  pull request of character work, beside the commit rule.
- `avatar-authoring`: the same marking rule, beside its commit rule.

## Impact

- **CI:** a new workflow under `.github/workflows/`. `test-and-build.yml` is
  not changed.
- **Agent instructions:** `.agents/skills/character-work.md`. The two character
  skills already follow it, so their `SKILL.md` files need no new wording
  unless the design finds a gap.
- **Specs:** `openspec/specs/ci-checks/spec.md`,
  `openspec/specs/dndbeyond-ingest/spec.md` and
  `openspec/specs/avatar-authoring/spec.md`.
- **Glossary:** `openspec/glossary.md` (already committed).
- **App code, dependencies, repo settings:** no change.
