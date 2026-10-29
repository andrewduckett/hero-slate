**Why:** A tap on the HP bar or a pool jumps straight to its new state, so a 9-year-old can miss that her -1 landed; the trackers are otherwise complete, so this is the remaining rough edge, and it sets the app's first motion rule.

## Story

#47 tap-animations — HP and pool changes ease into place instead of jumping
https://github.com/andrewduckett/hero-slate/issues/47

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | What moves today? | Only the HP card's down-state dim, a 300 ms opacity fade; bars and dots change instantly, and nothing checks `prefers-reduced-motion` | Evidence: `src/lib/character/HitPointsBlock.svelte`, `ResourcePoolsBlock.svelte` |
| D2 | Does the down-state dim join the shared timing? | Yes: it uses the shared timing and is instant under reduced motion | User |
| D3 | Shared duration and easing? | 200 ms, `ease-out` | User |
| D4 | Where does the motion rule live? | One shared timing, defined once in `src/lib/theme/base.css` and specified in `theming`; `character-sheet` and `resource-pools` each require their trackers to ease with it | User |
| D5 | What does reduced motion do? | `prefers-reduced-motion: reduce` sets the shared duration to 0, so every eased change is instant | Evidence: issue #47 scope |
| D6 | What eases on each tracker? | HP and counter-pool fill bars ease their width; a pool dot eases its background and border colours; the HP card eases its down-state opacity | Evidence: issue #47 scope; dot state is colour-only in `ResourcePoolsBlock.svelte` |
| D7 | Does a bar animate on first load or a character switch? | No: each mount renders at its resolved width, and a new character remounts the tracker | Evidence: `untrack` once-capture in both components |
| D8 | How is acceptance checked? | Tests read `base.css` and the two components' source for the tokens, the reduced-motion override and each transition; a reviewer checks the feel by visual review | User |
| D9 | Dots also fade when the light/dark toggle is flipped. Suppress it? | No: accept the calm 200 ms colour fade | User |

## Changes from the story

None. The story stands as written, and D2 brings the existing down-state dim under the shared timing.

Confirmed by user: yes
