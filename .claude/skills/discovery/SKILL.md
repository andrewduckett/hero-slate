---
name: discovery
description: Use when a PRD or product idea is too big for one OpenSpec change, when the user asks to split, plan, or prioritize work into a backlog or release plan, when a new feature request must be fitted into an existing backlog, or when personas and journeys need revising. Requires the openspec CLI and a GitHub repository reachable with gh.
---

# Discovery

Turn a product idea into a backlog of GitHub issues that `/opsx:propose` consumes one
at a time. Each kind of information has exactly one home:

| Information | Home |
|---|---|
| Product intent: problem, goals, non-goals | `openspec/prd.md` |
| Personas and journey map (the living map) | `openspec/discovery.md` |
| Stories, their priority, epics, dependencies | GitHub issues |

Discovery writes those three things and nothing else. It never writes application
code, never creates OpenSpec changes (propose does that, one issue at a time), and
never writes a separate roadmap, release-plan, or changelog document.

## Prerequisites

Check these first. If one fails, stop and tell the user what is missing.

1. `openspec list --json` succeeds. Use `root.path` from its output as the project
   root. Read `openspec/config.yaml`; its `context` and `rules` are constraints.
2. `gh auth status` succeeds and `gh repo view --json nameWithOwner,url` names the
   repository. Discovery needs GitHub issues; there is no fallback.

## Pick the starting point

| Observable state | Start at |
|---|---|
| `openspec/prd.md` missing | Phase 1 |
| `openspec/discovery.md` missing, or has no `## Personas` | Phase 2 |
| `discovery.md` has no `## Journey Map` | Phase 3 |
| Both files complete | Revise |

Confirm each phase with the user before writing it, then write it immediately; the
files on disk are the resume point. If the user said to proceed without them, make
the calls yourself and list every call in your final summary.

## Phase 1: Intent → `openspec/prd.md`

If `prd.md` exists, read it and do not restate it anywhere. Edit it only when the
request changes intent (a new goal or non-goal). If it is missing, write it with three
sections: **Problem**, **Goals**, **Non-goals**. Anything the input calls "later",
"maybe", or out of scope is a non-goal, not a story.

## Phase 2: Personas

One to four people with needs, not roles. Each gets **Who**, **Goal**, **Pain today**,
**Success looks like**.

## Phase 3: Journey map

For each primary persona, draw the stages as an ASCII flow and number them. Read the
code and annotate every stage `supported`, `partial`, or `gap`. Cite the issue that
closes a gap as a full link, `[#N](https://github.com/<owner>/<repo>/issues/N)` —
a bare `#N` does not link inside a repository file.

`discovery.md` has exactly these sections:

```markdown
# Discovery: <product>

> The living map behind the backlog: who it serves and the journeys it supports.
> Product intent lives in `openspec/prd.md`. The backlog is GitHub issues.

## Personas
### <Name> — <role>
- **Who**: … - **Goal**: … - **Pain today**: … - **Success looks like**: …

## Journey Map
<ASCII flow, then numbered stages with status and issue links>

## Backlog
The backlog is GitHub issues: <repo url>/issues.
- Epic: <name> — [#N](<url>)
```

No other sections: git history, not a Change Log; issues, not a MoSCoW list; the
issue a question blocks, not Open Questions.

## Phase 4: Stories → GitHub issues

**Read the backlog first:** `gh issue list --state all --limit 500 --json number,title,state,body,assignees`.
If new work fits an open, unassigned story, update that issue and re-check its size.
Never edit a closed issue; add a new story instead.

**Cut stories:**

- Every story answers a need the input states or a journey gap shows. Plausible
  enhancements nobody asked for are not stories.
- Each is a thin vertical slice: end-to-end and demoable. A persona can do something
  new when it ships. Never a horizontal layer ("data model", "API").
- A new product's first story is the walking skeleton: the thinnest path through the
  whole journey.
- Each fits one OpenSpec change: its proposal's what-and-why fits in about 200
  words. List every story that looks bigger with a split line, and split it.
- Order by dependency, then value.
- Won't items go to `prd.md` non-goals, never to issues. A Could item not yet cut
  into a story may be an issue whose body says `**Not yet a story.**`.
- An epic is a named capability with two or more stories. It is never a release,
  phase, or milestone.

**Every story issue uses this body.** Every field is required; a story propose reads
cold must stand alone.

```markdown
<one-line outcome>

- **Persona served**: <persona>
- **Journey segment**: <stage(s)>
- **MoSCoW**: <Must | Should | Could> — <why, tied to the journey>
- **Why this story / why now**: <rationale>
- **Depends on**: <#N, #N — or "nothing">
- **Scope**: in: <2–5 items> / out: <1–2 items>
- **Relevant code**: <paths you read, or "new">
```

Story title: `<kebab-case-name> — <one-line outcome>`. Epic title: `Epic: <capability>`;
its body is a short paragraph naming the capability and the decisions its stories
share.

**Preview before creating.** Issues are public. Show a table of every new or changed
issue — title, epic, blocked by, MoSCoW — and get confirmation. A user who already
said to proceed has confirmed.

**Create in order:** epics before their stories, blockers before what they block.

```bash
gh issue create --title "<title>" --body-file <file> [--parent <epic#>] [--blocked-by <n>,<n>]
```

The command prints the issue URL; the number is its last segment. Put `#N` numbers of
already-created issues into later bodies. Stop at the first error. Before retrying,
search for the title (`gh issue list --state all --search "<title> in:title"`) so
you never create a duplicate.

Then update `discovery.md`: journey-stage links and the epic list under `## Backlog`.

## Revise

1. Read `prd.md`, `discovery.md`, and the issues.
2. Re-annotate every journey stage against the code; stages move to `supported` as
   their issues close.
3. Route the request: changed intent → `prd.md`; new persona or stage →
   `discovery.md`; new work → Phase 4.
4. A superseded story: `gh issue close <n> --reason "not planned" --comment "Superseded by #M: <reason>"`.

## Hand-off

If `openspec/config.yaml`'s `context` does not already say the backlog is GitHub
issues, offer to add this (with the user's confirmation):

> The backlog is GitHub issues, each with its MoSCoW priority; openspec/discovery.md
> holds personas and journeys. When asked to propose the next change without a
> specific request, take the lowest-numbered open issue that is not an epic, has no
> open blocker, and is not assigned. Assign it when proposing, and have the draft PR
> say `Closes #<n>`. An issue marked "Not yet a story" is cut into a story first.

Then tell the user to run `/opsx:propose` for the next change. One issue per change.

## Common mistakes

| Mistake | Instead |
|---|---|
| Writing a roadmap or release-plan document | Only `prd.md`, `discovery.md`, and issues |
| Creating OpenSpec changes or proposals | Never; propose creates them one issue at a time |
| A story body missing fields | Fill every field of the template |
| Epics named after releases or phases | An epic is a capability |
| A "later, maybe" idea as a story | A non-goal in `prd.md` |
| One story for a whole app or subsystem | Split into ~200-word vertical slices |
| Sources, Change Log, Open Questions, or MoSCoW sections in `discovery.md` | The four sections only |
