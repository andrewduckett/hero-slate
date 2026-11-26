<!-- Plain language: Write questions and answers so a reader without the conversation can understand each decision and its source. Keep the confirmation marker exactly as written. -->

## Story

#134 character-work-ci-check — a character work pull request that touches anything else fails CI.
https://github.com/andrewduckett/hero-slate/issues/134

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Which pull requests does the check judge? | Only a pull request marked as character work. An unmarked pull request passes, because a feature pull request may change character files and code together. Local edits are not blocked. | Evidence: #134 packet, **Scope** |
| D2 | How is a pull request marked as character work? | Its title starts with `char:`. The check runs again when the title is edited, so adding or removing the mark takes effect at once. | Assumption |
| D3 | Do the commits in a character work pull request also start with `char:`? | No. Only the pull request title carries the mark; commits keep the Conventional Commits types. | Assumption |
| D4 | Which changed files fail a marked pull request? | Any file added, changed or deleted outside `static/characters/`, including either side of a rename that crosses that boundary. Files in subfolders of `static/characters/` count as inside. Changes are compared against the pull request's base branch, so a stacked pull request is judged only on its own changes. | Assumption |
| D5 | What does a failed check tell the Author? | It lists every changed path outside `static/characters/`, and gives two ways to fix it: move that change to its own issue and pull request, or remove the `char:` mark if the pull request is not character work. | Assumption |
| D6 | Is the new check a required status check on `main`? | No. It stays advisory, like `test and build`; merge settings are out of scope. | Assumption |
| D7 | Should "character work pull request" go in `openspec/glossary.md`? | Yes, next to Character work: a pull request whose title starts with `char:`, which may change only files in `static/characters/`. Tentative: not written to the glossary until the user confirms this ledger. | Assumption |
| D8 | Where do agents learn the marking rule? | In the boundary reference, `.agents/skills/character-work.md`, beside its commit rule. | Evidence: #134 packet, **Scope** |

## Changes from the story

None. D2 settles the packet's open question about how to mark the pull request.

Confirmed by user: no
