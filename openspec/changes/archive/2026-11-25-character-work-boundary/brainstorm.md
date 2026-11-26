<!-- Plain language: Write questions and answers so a reader without the conversation can understand each decision and its source. Keep the confirmation marker exactly as written. -->

## Story

#132 character-work-boundary — an agent doing character work changes only character files, and sends a gap to an issue. https://github.com/andrewduckett/hero-slate/issues/132

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | What is Character work? | Creating or changing a character's files: its character file, its avatar and its line in the character manifest. | Evidence: `openspec/glossary.md` (commit `a52cc64`, from #131) |
| D2 | Which paths may character work write? | Only `static/characters/` and `.workspace/`. `.workspace/` is git-ignored scratch, so this matches the glossary's "changes nothing outside `static/characters/`". | Evidence: #131 Shared decisions |
| D3 | What counts as "what the sheet format supports today"? | Whatever the app reads and draws today, as the current specs define it: character-data, character-sheet, resource-pools, custom-sections, character-links, rich-text and theming. The shared reference points to those specs and does not copy the format. A preview warning that an entry was dropped shows the choice is unsupported. | Assumption |
| D4 | What does the agent do on a gap? | It says the sheet cannot do it, offers the nearest supported choice (often prose in a custom section row), offers to open an issue through `lets-shape`, then carries on with the sheet. | Evidence: #131 Shared decisions |
| D5 | What if the Author still wants the app change built now? | The agent never changes app code during character work. The change starts as an issue through `lets-shape` and is built later through `lets-go`, on its own branch and pull request. The Author can start that run once the sheet is done. | Assumption |
| D6 | Does the boundary also cover commits? | Yes. A commit of character work holds only character files; `df6944d` and `843269e` broke this. The skills still do not commit. | Assumption |
| D7 | Where is the boundary stated? | In one shared reference that `dndbeyond-to-slate` and `character-avatar` read and follow, and in a "Character work" section in the project-owned part of `AGENTS.md`, with the boundary and a routing line, so a hand edit with no skill running gets the same rule. The lets-spec block in `AGENTS.md` stays untouched. | Evidence: #132 packet |
| D8 | Which specs change? | The guided flow requirements of `dndbeyond-ingest` and `avatar-authoring`. | Evidence: #132 packet |
| D9 | What is out of scope? | A new skill for changing an existing sheet (#133) and any enforcement in code or CI (#134). | Evidence: #132 packet |

## Changes from the story

None. The story stands as written. The answers to D3, D5 and D6 fill in detail the packet left open.

Confirmed by user: yes
