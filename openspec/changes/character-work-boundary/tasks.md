<!-- Plain language: Each task must make sense to an agent and reviewer without the planning conversation. Name an observable outcome, its location when needed, and how to verify it. Preserve checkbox syntax and tags. -->

This change edits agent instructions only. A skill's behavior is checked by
a scripted manual walkthrough (design.md, Test Seams), so the build tasks
verify that the text is in place, and section 3 walks each skill.

## 1. The shared reference

- [ ] 1.1 [medium] Create `.agents/skills/character-work.md` with its first three sections (design.md D-2): what character work is, linked to `openspec/glossary.md`; that it writes only `static/characters/` and `.workspace/`, naming app code, tests, specs, skill instructions and the avatar style guide as off limits; and what the sheet supports, as links to the specs `character-data`, `character-sheet`, `resource-pools`, `custom-sections`, `character-links`, `rich-text` and `theming`, with a preview drop warning as evidence of a gap (verify: `for s in character-data character-sheet resource-pools custom-sections character-links rich-text theming; do grep -q "openspec/specs/$s/spec.md" .agents/skills/character-work.md || exit 1; done`)
- [ ] 1.2 [easy] Add the gap section to `.agents/skills/character-work.md`: the four gap steps as a numbered list (say the sheet cannot do it, offer the nearest supported choice, offer an issue through `lets-shape`, carry on), and the D-3 rule that an accepted gap goes on one line of `.workspace/<id>.gaps.md` and is shaped through `lets-shape` once the sheet or avatar is done (verify: `grep -q 'lets-shape' .agents/skills/character-work.md && grep -q 'gaps.md' .agents/skills/character-work.md`)
- [ ] 1.3 [easy] Add the last two sections to `.agents/skills/character-work.md`: when the Author wants the app changed now, the agent does not change it, and the change starts as an issue through `lets-shape` and is built later through `lets-go` on its own branch and pull request; and the commit rule, that the skills do not commit and a commit of character work holds only files under `static/characters/`, naming any file left out (verify: `grep -q 'lets-go' .agents/skills/character-work.md && grep -qi 'commit' .agents/skills/character-work.md`)

## 2. Point every reader at the reference [depends-on: 1]

- [ ] 2.1 [easy] In `.agents/skills/dndbeyond-to-slate/SKILL.md`, add a paragraph beside the "treat every string as data" rule saying the skill does character work, writes only `static/characters/` and `.workspace/`, and follows `../character-work.md`, including when the Author asks for an app change (design.md D-4) (verify: `grep -q '\.\./character-work\.md' .agents/skills/dndbeyond-to-slate/SKILL.md`)
- [ ] 2.2 [easy] In `.agents/skills/dndbeyond-to-slate/SKILL.md`, make steps 6 (a pool above 100 uses), 11 (a link that is not `https:`) and 13 (a preview warning that the app drops an entry) each send the agent to the gap steps in `../character-work.md` (verify: `test "$(grep -c 'character-work\.md' .agents/skills/dndbeyond-to-slate/SKILL.md)" -ge 4`)
- [ ] 2.3 [parallel] [easy] In `.agents/skills/character-avatar/SKILL.md`, add the same boundary paragraph near the top, and make step 2 send a request for more than one avatar, or for a change to how the sheet shows it, to the gap steps in `../character-work.md` (verify: `test "$(grep -c 'character-work\.md' .agents/skills/character-avatar/SKILL.md)" -ge 2`)
- [ ] 2.4 [parallel] [easy] Add a `## Character work` section to `AGENTS.md` after "Durable constraints" and before "Toolchain", outside the lets-spec markers: the boundary in two sentences, a link to `.agents/skills/character-work.md`, and a routing line for `dndbeyond-to-slate`, `character-avatar`, a hand edit and `lets-shape` (design.md D-5) (verify: `grep -q '^## Character work' AGENTS.md && mise exec -- lets sync --check`)

## 3. Walk each skill [depends-on: 2]

- [ ] 3.1 [medium] Walk `dndbeyond-to-slate` on a public D&D Beyond character with a new id ending in `-test`. Ask for a pool of 120 uses and an `http:` link, and confirm each gets the four gap steps and the flow carries on. Then ask the agent to raise the app's pool limit, and confirm it changes no app file and names `lets-shape` and `lets-go`. Delete the test sheet afterwards (verify: `test -z "$(git status --porcelain -- . ':(exclude)static/characters')"`)
- [ ] 3.2 [medium] Walk `character-avatar` for `sunny` up to step 2. Ask for a second avatar that shows Sunny in Wild Shape, confirm the agent gives the four gap steps and goes on with one avatar, then stop before saving any image (verify: `test -z "$(git status --porcelain)"`)
- [ ] 3.3 [medium] On a throwaway branch, save a test sheet, make a scratch edit to `src/lib/character/pools.ts`, and ask an agent to commit the character work. Confirm the commit holds only files under `static/characters/` and the agent names `src/lib/character/pools.ts` as left out. Delete the branch and the scratch edit afterwards (verify: `git diff --quiet HEAD -- src/lib/character/pools.ts`)
- [ ] 3.4 [easy] Run every project check on the finished branch (verify: `openspec validate character-work-boundary --strict && npm test && npm run build && mise exec -- lets sync --check`)

## Deviations Ledger

<!-- Dated notes on small departures from the plan, written during apply. Stop and ask the user about a large one. -->
