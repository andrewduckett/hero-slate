## Why

Pools can hold up to 100 uses, and every pool over 5 now draws 28 px dots. That is below the 44 px tap target the sheet promises, so even Urven's 7 Focus Points are harder to tap. Lay On Hands (35 uses on Gimdak) needs a compact control that is still easy to tap.

## What Changes

- Every pool of 1–12 uses draws 44 px dots. The rule that shrinks dots above 5 uses goes away (D1).
- A pool of 13–100 uses draws a counter instead of dots: a `current / max` readout, a bar, and −5 / −1 / +1 / +5 buttons (D2, D4). The buttons are 44 px and look like the dots, in the pool's palette (D3). An empty counter does not dim (D5).
- Both forms read and write the same `pools` state map, so a count survives a maximum that crosses 12 (D6).
- The counter's buttons and readout name the pool for screen readers (D7).
- The sheet's 44 px tap-target rule covers every pool control, not only dots (D8).
- The resource-pools spec drops the stale "`max` 13 does not render" scenario in favour of 101, and gains a counter requirement (D9).
- The ingest preview warning and the `dndbeyond-to-slate` skill say "100 uses" rather than "100 dots" or "12 dots" (D10).

No character file changes (D11). Nothing here is breaking: every pool that renders today still renders, with its stored count.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `resource-pools`: the dots requirement covers pools of 1–12 uses only; a new requirement adds the counter for 13–100; the over-limit scenario uses 101.
- `character-sheet`: the "Sheet fits a phone screen" requirement extends the 44 px tap target from pool dots to every pool control.
- `dndbeyond-ingest`: the "Draft validation" warning for a pool above 100 says the app tracks at most 100 uses, not 100 dots. The "Guided skill flow" tells the Author about a pool above 100, not above 12.

## Impact

- **Code:** `src/lib/character/ResourcePoolsBlock.svelte` (dot size, the new counter), `src/lib/character/pools.ts` (the 12-use break point beside `MAX_POOL_DOTS`), and possibly `src/lib/character/HitPointsBlock.svelte` if the design extracts a shared counter.
- **Ingest:** the warning text in `src/lib/ingest/ddb/validate.ts`.
- **Docs:** `.claude/skills/dndbeyond-to-slate/SKILL.md`, which still says the app drops pools above 12.
- **Tests:** `ResourcePoolsBlock.test.ts`, `pools.test.ts` and the ingest validation tests.
- **State:** no change to the `pools` key or its shape. No new dependencies.
