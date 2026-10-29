**Why:** At iPad landscape width the home page splits the character cards into two columns, but a single list reads more simply for a young player, and the picker layout is fresh after #96 and #98.

## Story

#99 one-column-picker — the home page lists character cards in one column at every width
https://github.com/andrewduckett/hero-slate/issues/99

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | How many columns does the picker show? | One, at every viewport width | User |
| D2 | How wide is a card? | The full home page width, which stays capped at 44rem | User |
| D3 | Why two columns today? | The `ul` uses `repeat(auto-fill, minmax(min(16rem, 100%), 1fr))`, and 44rem has room for two 16rem tracks | Evidence: `src/lib/CharacterPicker.svelte` |
| D4 | How is one column accepted? | A browser-review scenario at 360 and 1024 CSS pixels wide; no new unit test, because jsdom computes no layout | User |
| D5 | Do the tap-target and no-sideways-scroll rules change? | No; both still hold and are re-checked in the same review | Evidence: `openspec/specs/home-picker/spec.md` |
| D6 | Does the avatar art change on a wider card? | No; it keeps its `min(40%, 8rem)` width, as the story puts portrait art out of scope | Evidence: issue #99 Scope |

## Changes from the story

None. PR #98 has merged, so the rebase the story warned about no longer applies.

Confirmed by user: yes
