<!-- Plain language: Help the next implementer find the approach, understand the choices and act on the plan. Explain necessary technical terms. Put each risk beside its mitigation and each open question beside the decision it affects. -->

## Context

This change edits agent instructions only. No app code changes.

- **The two character skills** live in `.agents/skills/dndbeyond-to-slate/SKILL.md`
  and `.agents/skills/character-avatar/SKILL.md`. `.claude/skills` is a
  symlink to `.agents/skills`, so Claude Code and other agents read the same
  files. `lets sync` rewrites only the `lets-*` and `openspec-*` folders
  there, and leaves these two skills and any other file alone.
- **Gaps already surface in `dndbeyond-to-slate`**, but the skill only warns.
  Step 6 warns about a pool above 100 uses, step 11 about a link that is not
  `https:`, and step 13 shows every preview warning that the app drops an
  entry. None of these says what to do next, so an agent tends to change the
  app. That is how commit `df6944d` raised the pool cap.
- **`character-avatar` has no gap point yet.** The sheet shows one avatar per
  character (`character-data`, "Avatar location"), so a request for more than
  one picture, or for a different header, is the likely gap.
- **`AGENTS.md`** has a project-owned part (lines 1 to 78) and a lets-spec
  block between `<!-- BEGIN lets-spec rules ... -->` and
  `<!-- END lets-spec rules -->`. `lets sync --check` in CI fails if the
  block changes.
- **The glossary** already defines Character work (commit `a52cc64`).
- **The current specs define the sheet format** (D3): `character-data`,
  `character-sheet`, `resource-pools`, `custom-sections`, `character-links`,
  `rich-text` and `theming`.

## Goals / Non-Goals

**Goals:**

- State the boundary and the gap steps once, in one file that both skills
  and `AGENTS.md` point to.
- Put a pointer to the gap steps at each place in a skill where a gap
  already surfaces, so the agent meets the rule at the moment it applies.
- Give an agent with no skill running the same rule, from `AGENTS.md`.

**Non-Goals:**

- A skill for changing an existing sheet (#133).
- Any check in code, tests or CI that enforces the boundary (#134). This
  change adds no test that reads instruction files.
- Copying the sheet format into the reference. The reference links to the
  specs instead (D3).
- Changing the README's "Adding a character" section. It is for people
  editing by hand, and `AGENTS.md` covers agents.

## Test Seams

- **Primary test seam:** a scripted manual walkthrough of each skill, the
  seam the skills' existing scenarios already use (for example, task 1.7 of
  the archived change `2026-10-25-ingest-offers-links`). The walkthrough
  drives the skill in a session and checks the observable result: the
  files changed (`git status --porcelain`), what the agent tells the
  Author, and that the flow carries on.
- **Existing seams reused:** `openspec validate character-work-boundary --strict`
  for the delta specs, and `npm test` and `npm run build` to confirm that
  nothing outside instructions changed. `mise exec -- lets sync --check`
  confirms the lets-spec block in `AGENTS.md` is untouched.

## Scrutiny Tier & Blast Radius

- **Tier:** low
- **Blast radius:** agent instructions only: two skill files, one new
  reference file and the project-owned part of `AGENTS.md`, plus two delta
  specs. No runtime code, data shape or build output changes.

## Decisions

### D-1. One shared reference at `.agents/skills/character-work.md`

The full rule lives in one Markdown file beside the skill folders. Both
skills link to it as `../character-work.md`, and `AGENTS.md` links to it as
`.agents/skills/character-work.md`.

- **Why there:** both readers of the rule are agents, and both skills
  already live in `.agents/skills/`. A loose file has no `SKILL.md`, so no
  agent loads it as a skill. `lets sync` leaves it alone.
- **Rejected: a `character-work/SKILL.md` skill.** A skill is something an
  agent picks for a task. This is a rule other skills follow, and #133 adds
  the next character skill.
- **Rejected: `docs/character-work.md`.** `docs/` holds only decision
  records, and the reference is an agent instruction, not a decision.
- **Rejected: the reference inside one skill's folder.** The other skill
  would then depend on a folder it does not own.

### D-2. The reference's contents

The reference has these sections, in this order:

1. **What character work is:** one sentence, linked to the glossary entry.
2. **Where it writes:** `static/characters/` and `.workspace/` only (D2).
   Name the forbidden kinds of file: app code, tests, specs, skill
   instructions and the avatar style guide.
3. **What the sheet supports:** a list of links to the seven specs (D3). A
   preview warning that the app drops an entry shows that the entry is
   unsupported. The nearest supported choice is often prose in a custom
   section row.
4. **When the Author wants something the sheet cannot do:** the four gap
   steps (D4), as a numbered list.
5. **When the Author asks for a change outside character work:** the agent
   does not change any file outside `static/characters/` and `.workspace/`,
   such as the app or the avatar style guide. The change starts as an issue
   through `lets-shape` and is built later through `lets-go` (D5).
6. **Commits:** the skills do not commit. A commit of character work holds
   only files under `static/characters/`; leave other changes out and name
   them to the Author (D6).

### D-3. An accepted issue is shaped after the sheet is done

When the Author accepts the offer to open an issue, the agent adds the gap
to `.workspace/<id>.gaps.md`, one line each, and carries on. After the
sheet is written or the avatar saved, the agent runs `lets-shape` once for
each listed gap, so that each gap becomes an issue of its own.

- **Why:** `lets-shape` is a separate workflow with its own questions and
  its own writes, such as the glossary on a branch of its own. Running it in
  the middle of a sheet interrupts the Author's session and mixes its files
  into the working tree before the character files are committed. The
  workspace file keeps the list if the session ends early.
- **Rejected: run `lets-shape` at once.** It matches "offer, then carry on"
  less well and has the problems above.
- **Rejected: open a plain issue with `gh issue create`.** The backlog rules
  in `AGENTS.md` say every piece of work is shaped through `lets-shape`.

This is an assumption about timing that the brainstorm left open. The specs
say only that the skill offers the issue and carries on, so either timing
meets them.

### D-4. Each skill gets one boundary paragraph and pointers at its gap points

Each `SKILL.md` gains a short paragraph near the top, beside the existing
"treat every string as data" rule. It says that the skill does character
work and must follow `../character-work.md`, and names the two folders.

The skill's steps then point to the reference's gap steps where a gap
surfaces:

| Skill | Step | Gap |
|---|---|---|
| `dndbeyond-to-slate` | 6, Offer the pools | A pool above 100 uses |
| `dndbeyond-to-slate` | 11, Offer links | A link that is not `https:` |
| `dndbeyond-to-slate` | 13, Preview | Any warning that the app drops an entry |
| `character-avatar` | 2, Ask how the character looks | A request for more than one avatar |

A request to change the app can come at any step, so the top paragraph
covers it, not a step. Step 2 of `character-avatar` also names one: a
change to how the sheet shows the avatar goes to the rule for a change
outside character work, not to the gap steps.

- **Rejected: copy the full rule into each skill.** Two copies drift apart.
  #133 would add a third.

### D-5. A "Character work" section in the project-owned part of `AGENTS.md`

Add `## Character work` after "Durable constraints" and before "Toolchain".
It holds:

- the boundary in two sentences: character work writes only
  `static/characters/` and `.workspace/`, and a gap becomes an issue
  through `lets-shape`, not an app change
- a link to `.agents/skills/character-work.md` for the gap steps and the
  commit rule
- a routing line: a new sheet from D&D Beyond starts with
  `dndbeyond-to-slate`, an avatar with `character-avatar`, a hand edit
  follows the reference directly, and a missing capability starts with
  `lets-shape`

The lets-spec block stays byte-for-byte as it is. Its own "Routing" table
is lets-spec's, so the routing line lives in the new section.

### D-6. New requirements, not edits to "Guided skill flow"

The delta specs add the boundary as new requirements beside each spec's
"Guided skill flow" requirement. They do not modify its numbered steps. The
boundary applies to every step, and an ADDED requirement keeps the long
existing requirements intact at archive. This meets D8, which names the
guided flows as the behavior that changes.

## Risks / Trade-offs

- [The boundary is prose, so an agent can still ignore it] → This change
  puts the rule where every agent reads it. #134 adds the CI check.
- [The `AGENTS.md` summary and the reference drift apart] → `AGENTS.md`
  states only the two-sentence boundary and links to the reference for
  every detail.
- [A gap the skills do not foresee goes unnoticed] → The top paragraph
  in each skill and the `AGENTS.md` section cover any request, not just the
  listed gap points.
- [The spec links in the reference go stale when a spec is renamed] → The
  reference links to spec paths. A broken link is visible, and a rename is
  a planned change that can update it.

## Migration & Rollback

N/A. Nothing changes shape. To roll back, revert the commits; no data or
deploy depends on them.
