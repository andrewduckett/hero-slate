## Story

#46 pool-number-fallback — a pool with more than 12 uses shows a counter like hit points; smaller pools keep full-size dots.
https://github.com/andrewduckett/hero-slate/issues/46

## Decisions

| # | Question | Answer | Source |
|---|---|---|---|
| D1 | Which pools get dots, and how big? | Every pool of 1–12 uses gets 44 px dots with today's 8 px gap. The 28 px rule for pools over 5 goes away. On a 360 px phone a pool of 6–12 wraps onto 2–3 rows. | User |
| D2 | Which pools get the counter? | Pools of 13–100 uses. 12 is the most 44 px dots that fit one row at the page's full width. | Evidence: #46 |
| D3 | How should the counter look? | It follows the pool's size, not the hit-points size: 44 px round buttons with the dots' gap, styled like the dots (restore filled, spend outlined) in the pool's palette, under the pool's label. Exact readout and bar sizes are for the design. | User |
| D4 | What does the counter hold? | A `current / max` readout, a bar, and −5 / −1 / +1 / +5 buttons, spend on the left and restore on the right, as hit points has. Each tap clamps to 0..max. | Evidence: #46, `HitPointsBlock.svelte` |
| D5 | Does an empty counter pool dim? | No. An empty pool is normal play, not "down". | Evidence: #46 |
| D6 | Where is the counter's count stored? | In the same `pools` map under the pool's id, so a pool whose max crosses 12 keeps its count. | Evidence: #46, `pools.ts` |
| D7 | What does a screen reader hear? | Each counter button and the readout name the pool, as the dots do (for example "Lay On Hands: 35 remaining"), because a sheet can show several counters. | User |
| D8 | Does the 44 px tap-target rule cover the counter? | Yes. The character-sheet requirement extends from "each pool dot" to every pool control. | User |
| D9 | What changes in the resource-pools spec? | The stale "`max` 13 does not render" scenario moves to 101, the dots requirement covers only 1–12, and a counter requirement covers 13–100. | Evidence: `openspec/specs/resource-pools/spec.md` |
| D10 | What changes in the ingest wording? | The preview warning, the ingest spec and the `dndbeyond-to-slate` skill say "100 uses", not "100 dots" or "12 dots". | Evidence: `validate.ts`, `dndbeyond-ingest/spec.md`, `SKILL.md` |
| D11 | Do any character files change? | No. Gimdak's 35-use Lay On Hands already loads, and only its rendering changes. | Evidence: `static/characters/gimdak.yaml` |

## Changes from the story

- Added: the counter follows the dot size (44 px buttons, styled like dots), not the hit-points size (52 px buttons, large readout). This is a refinement of "like hit points" (D3).
- Added: the character-sheet tap-target requirement now covers the counter's buttons (D8).

Confirmed by user: yes
